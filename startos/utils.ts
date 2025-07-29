/**
 * Nostr validation utilities
 */


/**
 * Validates if a string is a valid Nostr private key in nsec format
 * @param nsec - The private key string to validate
 * @returns true if valid, false otherwise
 */
export function isValidNsec(nsec: string): boolean {
    if (!nsec || typeof nsec !== 'string') {
        return false
    }

    // Check if it starts with 'nsec1'
    if (!nsec.startsWith('nsec1')) {
        return false
    }

    // Remove the 'nsec1' prefix
    const encoded = nsec.slice(5)

    // Check if the encoded part is not empty
    if (!encoded || encoded.length === 0) {
        return false
    }

    // Nostr private keys should be 32 bytes when decoded
    // Bech32 encoding adds some overhead, so the encoded string should be around 63 characters
    // (32 bytes * 8 bits / 5 bits per character + checksum)
    if (encoded.length < 50 || encoded.length > 70) {
        return false
    }

    // Check if it contains only valid Bech32 characters (a-z, 0-9)
    const validChars = /^[a-z0-9]+$/
    if (!validChars.test(encoded)) {
        return false
    }

    return true
}

/**
 * Validates if a string is a valid Nostr public key in npub format
 * @param npub - The public key string to validate
 * @returns true if valid, false otherwise
 */
export function isValidNpub(npub: string): boolean {
    if (!npub || typeof npub !== 'string') {
        return false
    }

    // Check if it starts with 'npub1'
    if (!npub.startsWith('npub1')) {
        return false
    }

    // Remove the 'npub1' prefix
    const encoded = npub.slice(5)

    // Check if the encoded part is not empty
    if (!encoded || encoded.length === 0) {
        return false
    }

    // Nostr public keys should be 32 bytes when decoded
    // Bech32 encoding adds some overhead, so the encoded string should be around 63 characters
    if (encoded.length < 50 || encoded.length > 70) {
        return false
    }

    // Check if it contains only valid Bech32 characters (a-z, 0-9)
    const validChars = /^[a-z0-9]+$/
    if (!validChars.test(encoded)) {
        return false
    }

    return true
}

/**
 * Validates that a private key and public key form a valid pair
 * Note: This is a basic validation - for full cryptographic validation,
 * you would need to derive the public key from the private key and compare
 * @param nsec - The private key in nsec format
 * @param npub - The public key in npub format
 * @returns true if both keys are in valid format, false otherwise
 */
export function isValidKeyPair(nsec: string, npub: string): boolean {
    return isValidNsec(nsec) && isValidNpub(npub)
}

/**
 * Validates Nostr relay URLs
 * @param relay - The relay URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidRelayUrl(relay: string): boolean {
    if (!relay || typeof relay !== 'string') {
        return false
    }

    // Trim whitespace
    const trimmed = relay.trim()
    if (trimmed.length === 0) {
        return false
    }

    // Check for valid protocols
    if (!trimmed.startsWith('ws://') && !trimmed.startsWith('wss://')) {
        return false
    }

    // Basic URL validation - should have a host
    const urlPattern = /^(ws|wss):\/\/[^\s\/$.?#].[^\s]*$/i
    return urlPattern.test(trimmed)
}

/**
 * Validates a comma-separated list of relay URLs
 * @param relaysString - Comma-separated relay URLs
 * @returns Array of valid relay URLs, empty array if none valid
 */
export function validateRelayList(relaysString: string): string[] {
    if (!relaysString || typeof relaysString !== 'string') {
        return []
    }

    const relays = relaysString.split(',').map(relay => relay.trim()).filter(relay => relay.length > 0)
    return relays.filter(relay => isValidRelayUrl(relay))
}