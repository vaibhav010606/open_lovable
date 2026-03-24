import { createClient } from '@supabase/supabase-js'

const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const primaryKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key"

// Secondary fallback credentials
const fallbackUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_FALLBACK
const fallbackKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_FALLBACK

// Custom fetch wrapper to handle fallback
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const response = await fetch(input, init)
    
    // If successful or a normal client error (but NOT 404 Not Found), return it
    // 404 is excluded because 'Table not found' should trigger a fallback to the secondary database
    if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 404)) {
      return response
    }
    
    // For 5xx Server Errors, 429 Too Many Requests, or 404 Not Found, throw to trigger fallback
    throw new Error(`Primary Supabase responded with status: ${response.status}`)
  } catch (error) {
    // If there's a fallback configured and the request failed (network error or thrown above)
    if (fallbackUrl && fallbackKey) {
      console.warn('⚡ Primary Supabase failed, falling back to secondary...', error)
      
      let newUrl = ''
      let originalHeaders: HeadersInit | undefined = undefined
      let method = init?.method

      if (typeof input === 'string') {
        newUrl = input
      } else if (input instanceof URL) {
        newUrl = input.toString()
      } else if (typeof input === 'object' && input !== null) {
        // If input is a Request object
        if ('url' in input) newUrl = input.url
        if ('method' in input) method = method || input.method
        if ('headers' in input) originalHeaders = (input as Request).headers
      }

      // Replace primary URL with fallback URL
      if (newUrl.startsWith(primaryUrl)) {
        newUrl = newUrl.replace(primaryUrl, fallbackUrl)
      }
      
      // We must construct a new init object to avoid mutating the original
      const newInit: RequestInit = { ...init, method }
      
      // If setup passed headers in init, use them (they usually override Request headers)
      if (init && init.headers) {
        originalHeaders = init.headers
      }
      
      // Rebuild completely new headers for the fallback request
      const headers = new Headers(originalHeaders)
      
      // Always update the apikey header
      headers.set('apikey', fallbackKey)
      
      // Update Authorization ONLY if it was using the primary anon key or was missing
      // If it contains a user's JWT (anything other than the primary anon key), we keep it!
      const currentAuth = headers.get('Authorization')
      if (!currentAuth || currentAuth === `Bearer ${primaryKey}`) {
        headers.set('Authorization', `Bearer ${fallbackKey}`)
      }
      
      newInit.headers = headers
      
      // Attempt the request on the fallback instance
      return fetch(newUrl, newInit)
    }
    
    // If no fallback is configured or it's another error, bubble it up
    throw error
  }
}

export const supabase = createClient(primaryUrl, primaryKey, {
  global: {
    fetch: customFetch
  }
})
