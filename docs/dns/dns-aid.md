# DNS-AID records for gelolaus.com

DNS cannot be published from this repository. These records go in the DNS
zone for `gelolaus.com` at the DNS host, and the zone must be signed with
DNSSEC. Until then the DNS-AID check will keep failing.

## Records

```dns
_index._agents.gelolaus.com. 3600 IN HTTPS 1 gelolaus.com. alpn="h2,h3" port=443
_mcp._agents.gelolaus.com.   3600 IN SVCB  1 gelolaus.com. alpn="h2,h3" port=443 mandatory=alpn,port
_catalog._agents.gelolaus.com. 3600 IN TXT "url=https://gelolaus.com/.well-known/ai-catalog.json"
```

- Both service records are ServiceMode (priority 1) per RFC 9460.
- The endpoint paths live in the documents they lead to: `/mcp`,
  `/.well-known/mcp/server-card.json`, and `/.well-known/ai-catalog.json`.
- DNS-AID custom parameters, if added later, must use numeric `keyNNNNN`
  names until they are registered.

## DNSSEC

1. Enable DNSSEC signing at the DNS host.
2. Add the DS record it gives you at the registrar.
3. Check that a validating resolver returns the `ad` flag for the records.

## Check

```bash
dig +dnssec _index._agents.gelolaus.com HTTPS
dig +dnssec _mcp._agents.gelolaus.com SVCB
dig _catalog._agents.gelolaus.com TXT
```
