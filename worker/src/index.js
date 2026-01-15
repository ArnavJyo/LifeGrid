/**
 * Life Calendar Wallpaper - Cloudflare Worker
 * 
 * Generates dynamic wallpaper images based on:
 * - Year progress (days/weeks of the year)
 * - Life calendar (weeks of life)
 * - Goal countdown (days until target)
 */

import { getTimezone } from './timezone.js';
import { generateYearCalendar } from './generators/year.js';
import { generateLifeCalendar } from './generators/life.js';
import { generateGoalCountdown } from './generators/goal.js';
import { validateParams } from './validation.js';

// Resvg WASM for SVG to PNG conversion
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

let wasmInitialized = false;

async function initializeWasm() {
    if (!wasmInitialized) {
        await initWasm(resvgWasm);
        wasmInitialized = true;
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Route handling
        if (url.pathname === '/generate' || url.pathname === '/') {
            return await handleGenerate(request, url, corsHeaders, ctx);
        }

        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};

async function handleGenerate(request, url, corsHeaders, ctx) {
    try {
        // Validate and parse parameters
        const validated = validateParams(url);

        // Get timezone from country
        const timezone = getTimezone(validated.country);

        // Build options object
        const options = {
            width: validated.width,
            height: validated.height,
            bgColor: validated.bg,
            accentColor: validated.accent,
            timezone,
            clockHeight: validated.clockHeight,
            dob: validated.dob,
            lifespan: validated.lifespan,
            goalDate: validated.goal,
            goalName: validated.goalName
        };

        // Generate SVG based on type
        let svg;
        switch (validated.type) {
            case 'life':
                svg = generateLifeCalendar(options);
                break;
            case 'goal':
                svg = generateGoalCountdown(options);
                break;
            case 'year':
            default:
                svg = generateYearCalendar(options);
                break;
        }

        // Check if SVG output is requested
        if (validated.format === 'svg') {
            return new Response(svg, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=86400', // Cache for 1 day
                }
            });
        }

        // Convert SVG to PNG using resvg
        await initializeWasm();

        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'original'
            },
            font: {
                loadSystemFonts: false,
                defaultFontFamily: 'Inter',
            }
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        // Generate cache key based on parameters and current date
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `${validated.country}-${validated.type}-${validated.bg}-${validated.accent}-${validated.width}x${validated.height}-${today}`;

        return new Response(pngBuffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400', // Cache for 1 day
                'X-Cache-Key': cacheKey,
            }
        });
    } catch (e) {
        if (e.name === 'ZodError' || e.issues) {
            return new Response(JSON.stringify({
                error: 'Validation Error',
                issues: e.issues || e.errors
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.error('Worker Error:', e);
        return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
}

