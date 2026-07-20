const store = new MyOMEMOProtocolStore();
const address = new OMEMOAddress(recipientId, deviceId);
// The OMEMO version is required (no default); it is the protocol's XML namespace:
// "eu.siacs.conversations.axolotl" (XEP-0384 v0.3.0) or "urn:xmpp:omemo:2".
const sessionBuilder = new SessionBuilder(store, address, "urn:xmpp:omemo:2");

// Process a PreKey bundle from the server
try {
    await sessionBuilder.processPreKey({
        registrationId: <Number>,
        identityKey: <ArrayBuffer>,
        signedPreKey: {
            keyId: <Number>,
            publicKey: <ArrayBuffer>,
            signature: <ArrayBuffer>
        },
        preKey: {
            keyId: <Number>,
            publicKey: <ArrayBuffer>
        }
    });
    // Session established — ready to encrypt
} catch (error) {
    // Handle identity key conflict
}
