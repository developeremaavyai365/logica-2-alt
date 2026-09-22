/** Single Web3Forms key, shared by every form on the site — Contact,
 *  Feedback, and the careers application form. All three now deliver to
 *  hr@logicainfoway.com; that's set on Web3Forms' side (this form's
 *  Recipient Emails), not in this file, so changing where mail lands means
 *  editing settings on web3forms.com, not this constant.
 *
 *  Created 22 Sep 2026 as "Careers - Resume Applications" on Web3Forms, then
 *  extended to cover the site's other two forms on request — the name on
 *  Web3Forms' side no longer describes everything it's used for, worth a
 *  rename there if that's ever confusing. */
export const WEB3FORMS_ACCESS_KEY = '243a4241-1452-4896-aaac-2a479dbbf80f';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
