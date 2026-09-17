var REG_NONE = NewRegistrar('none');
var CF = NewDnsProvider('cloudflare');

D(
  'twente.dev',
  REG_NONE,
  DnsProvider(CF),
  DefaultTTL(1),
  A('@', '162.255.119.59', CF_PROXY_ON),
  A('staging', '162.255.119.59', CF_PROXY_ON),
  CNAME('www', 'twente.dev.', CF_PROXY_ON),
  CNAME('mta-sts', 'twente.dev.', CF_PROXY_ON),

  MX('@', 1, 'smtp.google.com.'),
  TXT('@', 'v=spf1 include:_spf.google.com ~all'),
  TXT(
    '_dmarc',
    'v=DMARC1; p=quarantine; sp=reject; pct=50; rua=mailto:0525d8c91ea04d888744ae8a292691cc@dmarc-reports.cloudflare.net; fo=1; adkim=r; aspf=r',
  ),
  TXT(
    'google._domainkey',
    'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq51oi2wjqgl05VWltzJUO7uGgpKhZyQFfLKoPR+N3pYQ7Uhjx5cAcJQ5ZsvnUtDfSNHncnTpX4d0Kqes/ygdfIozQIEaJkJqOkSG7ZevwWCU54iwOm13FzPNH0AeKMUCEnbfUcVE+r7w0EIu5V/nbZWj0drpHr3yVWI3ogXmV3hrWxi72S0EaY6Scz6D/VU2oO8OpKeq+BKl9AY0111Wrtfa/6qeyPfWORvqIq7mGn4V5uIia5M61avyxtJniWnFpGLE3u/Id4Wb067r6B29iyVhuGDMCs4uuOo1sBZkdW4NB76+BZ1bkWRaUrbiZdDZelSRfIFROG82QF3EobbNIQIDAQAB',
  ),
  TXT('_mta-sts', 'v=STSv1; id=20260917'),
  TXT('_smtp._tls', 'v=TLSRPTv1; rua=mailto:tlsrpt@twente.dev'),

  CAA('@', 'iodef', 'mailto:hello@twente.dev'),
  CAA('@', 'issue', 'letsencrypt.org'),
  CAA('@', 'issue', 'pki.goog; cansignhttpexchanges=yes'),
  CAA('@', 'issue', 'sectigo.com'),
  CAA('@', 'issue', 'ssl.com'),
  CAA('@', 'issuewild', 'letsencrypt.org'),
  CAA('@', 'issuewild', 'pki.goog; cansignhttpexchanges=yes'),
  CAA('@', 'issuewild', 'sectigo.com'),
  CAA('@', 'issuewild', 'ssl.com'),

  TXT('send', 'brevo-code:33f298f8293becb0e33f3a8949d69265'),
  TXT(
    '_dmarc.send',
    'v=DMARC1; p=none; rua=mailto:0525d8c91ea04d888744ae8a292691cc@dmarc-reports.cloudflare.net,mailto:rua@dmarc.brevo.com; fo=1; adkim=r; aspf=r',
  ),
  CNAME('brevo1._domainkey.send', 'b1.send-twente-dev.dkim.brevo.com.'),
  CNAME('brevo2._domainkey.send', 'b2.send-twente-dev.dkim.brevo.com.'),
  CNAME('mail.send', 'mail-send-twente-dev.brand.brevosend.com.'),
  CNAME('img.mail.send', 'mail-send-twente-dev.img.brand.brevosend.com.'),
  CNAME('r.mail.send', 'mail-send-twente-dev.r.brand.brevosend.com.'),

  TXT('@', 'google-site-verification=G3_ZFYbrFII1ROtdPsh0jGMvRrL2PjEzcTyl5-xbud8'),
  TXT('_atproto', 'did=did:plc:kva6d5jsysq6rwc4tdfsn47e'),
);
