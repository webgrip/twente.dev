import { SITE_URL } from '../../i18n/config.ts';
import { routePath } from '../../i18n/routes.ts';
import { MAIL_COPY } from './copy.ts';
import type { MailDocument, MailFact } from './document.ts';

const PAPER = '#f7f3ea';
const INK = '#111820';
const SIGNAL_RED = '#c3291b';
const MUTED = '#5d666e';
const FOOTER_INK = '#4a545c';
const RULE = '#b6bfbb';
const BUTTON_INK = '#ffffff';

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";

const LOGO_URL = `${SITE_URL}/brand/png/lockup-horizontal-512.png`;
const UNSUBSCRIBE_TAG = '{{ unsubscribe }}';
const PLACEHOLDER_GLYPHS = /[⟦⟧]/;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kicker(text: string): string {
  return `<tr>
              <td style="padding-bottom: 10px; font-family: ${MONO}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}">
                ${escapeHtml(text)}
              </td>
            </tr>`;
}

function headline(text: string): string {
  return `<tr>
              <td style="padding-bottom: 20px; font-size: 28px; line-height: 1.2; font-weight: 700; letter-spacing: -0.02em; color: ${INK}">
                ${escapeHtml(text)}
              </td>
            </tr>`;
}

function lead(text: string): string {
  return `<tr>
              <td style="font-size: 16px; line-height: 1.6; color: ${INK}; padding-bottom: 24px">
                <p style="margin: 0">${escapeHtml(text)}</p>
              </td>
            </tr>`;
}

function factRow(fact: MailFact, last: boolean): string {
  const spacing = last ? '0' : '8px';
  return `                        <tr>
                          <td style="padding: 0 12px ${spacing} 0; font-family: ${MONO}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; white-space: nowrap; vertical-align: top">
                            ${escapeHtml(fact.label)}
                          </td>
                          <td style="padding: 0 0 ${spacing}; font-size: 15px; line-height: 1.5; color: ${INK}; vertical-align: top">
                            ${escapeHtml(fact.value)}
                          </td>
                        </tr>`;
}

function facts(entries: MailFact[]): string {
  if (entries.length === 0) return '';
  const rows = entries.map((fact, index) => factRow(fact, index === entries.length - 1)).join('\n');
  return `<tr>
              <td style="padding: 0 0 24px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left: 3px solid ${SIGNAL_RED}">
                  <tr>
                    <td style="padding: 4px 0 4px 16px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
${rows}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function button(label: string, href: string): string {
  return `<tr>
              <td style="padding-bottom: 28px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background: ${SIGNAL_RED}; border-radius: 3px">
                      <a href="${escapeHtml(href)}" style="display: inline-block; padding: 13px 26px; color: ${BUTTON_INK}; font-size: 16px; font-weight: 600; text-decoration: none">${escapeHtml(label)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function footer(document: MailDocument): string {
  const copy = MAIL_COPY[document.locale];
  const privacyUrl = `${SITE_URL}${routePath('privacy', document.locale)}`;
  const linkStyle = `color: ${FOOTER_INK}; text-decoration: underline`;
  return `<tr>
              <td style="border-top: 1px solid ${RULE}; padding-top: 20px; font-size: 14px; line-height: 1.6; color: ${FOOTER_INK}">
                <p style="margin: 0 0 12px">
                  <strong style="color: ${INK}">${escapeHtml(copy.replyLead)}</strong> ${escapeHtml(copy.replyRest)}
                </p>
                <p style="margin: 0 0 12px">${escapeHtml(document.reason)}</p>
                <p style="margin: 0">
                  <a href="${UNSUBSCRIBE_TAG}" style="${linkStyle}">${escapeHtml(copy.unsubscribe)}</a>
                  //
                  <a href="${escapeHtml(privacyUrl)}" style="${linkStyle}">${escapeHtml(copy.privacy)}</a>
                  //
                  <a href="${SITE_URL}" style="${linkStyle}">twente.dev</a>
                </p>
              </td>
            </tr>`;
}

export function renderMail(document: MailDocument): string {
  const html = `<!doctype html>
<html lang="${document.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(document.subject)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${PAPER}; color: ${INK}; font-family: ${SANS}; -webkit-font-smoothing: antialiased">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; height: 0; width: 0">
      ${escapeHtml(document.preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${PAPER}">
      <tr>
        <td align="center" style="padding: 32px 16px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width: 100%; max-width: 600px; text-align: left">
            <tr>
              <td style="padding-bottom: 28px">
                <a href="${SITE_URL}" style="text-decoration: none"><img src="${LOGO_URL}" alt="twente.dev" width="180" height="31" style="display: block; width: 180px; height: 31px; border: 0" /></a>
              </td>
            </tr>

            ${kicker(document.kicker)}

            ${headline(document.headline)}

            ${lead(document.lead)}

            ${facts(document.facts)}

            ${button(document.callToAction.label, document.callToAction.href)}

            ${footer(document)}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  if (PLACEHOLDER_GLYPHS.test(html)) {
    throw new Error(
      `mail ${document.kind}/${document.key}.${document.locale} still carries a ⟦…⟧ placeholder; ` +
        'Brevo rewrites that href into a tracking link that 404s',
    );
  }

  return html;
}
