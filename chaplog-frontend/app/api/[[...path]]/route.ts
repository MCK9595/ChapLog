import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

// Get API service URL from Aspire service discovery
function getApiServiceUrl(): string {
  // Debug: Log all environment variables that contain 'api'
  const envVars = Object.keys(process.env).filter(key => key.toLowerCase().includes('api'));
  console.log('API-related environment variables:', envVars.map(key => `${key}=${process.env[key]}`));
  
  // Prefer HTTP over HTTPS to avoid SSL certificate issues in development
  const apiUrl = process.env.services__api__http__0 || process.env.services__api__https__0
  
  if (!apiUrl) {
    console.error('Aspire service discovery failed: API service URL not found')
    console.error('Available env vars:', {
      https: process.env.services__api__https__0,
      http: process.env.services__api__http__0
    })
    // Fallback to hardcoded localhost URL for development
    console.log('Falling back to hardcoded API URL: http://localhost:51741')
    return 'http://localhost:51741'
  }
  
  console.log('Using API URL:', apiUrl)
  return apiUrl
}

// Proxy all API requests to the actual API service
async function proxyRequest(request: NextRequest, path: string[]) {
  try {
    const apiBaseUrl = getApiServiceUrl()
    const apiPath = path.length > 0 ? path.join('/') : ''
    // Add /api prefix for the actual API endpoint
    const targetUrl = `${apiBaseUrl}/api/${apiPath}`
    
    console.log(`Proxying request: ${request.method} ${request.url}`)
    console.log(`Target URL: ${targetUrl}`)
    console.log(`API Base URL: ${apiBaseUrl}`)
    console.log(`Path parts:`, path)
    
    // Get request body if present
    let body: string | undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text()
    }
    
    // Copy headers, excluding some Next.js specific ones
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'transfer-encoding', 'te'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })
    
    // Log authorization header for debugging
    const authHeader = headers.get('Authorization')
    console.log(`Authorization header present: ${authHeader ? 'Yes' : 'No'}`)
    
    // Make the proxy request
    const response = await fetch(targetUrl + (request.nextUrl.search || ''), {
      method: request.method,
      headers,
      body,
    })
    
    // Copy response headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })
    
    // Return the proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
    
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { error: 'API service unavailable' },
      { status: 503 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path || [])
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path || [])
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path || [])
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path || [])
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path || [])
}