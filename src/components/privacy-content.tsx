export function PrivacyContent() {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none [&>h3]:mt-4">
      <h2>Privacy Policy</h2>
      <p className="text-muted-foreground text-xs">
        Last updated: 10 March 2026
      </p>

      <h3>1. Data Controller</h3>
      <p>
        The data controller for your personal data is the individual operator of
        Clockwork, contactable at <strong>contact@harryj.dev</strong>
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). We are
        responsible for deciding how your personal data is processed in
        connection with the Clockwork time-tracking and invoicing service
        (&ldquo;the Service&rdquo;).
      </p>

      <h3>2. Data We Collect</h3>
      <p>We collect the following categories of personal data:</p>
      <ul>
        <li>
          <strong>Account information:</strong> name, email address, password
          (stored as a bcrypt cryptographic hash &mdash; we never store your
          password in plain text)
        </li>
        <li>
          <strong>Business information:</strong> address, phone number, bank
          details (account number, sort code, bank name) for invoicing purposes
        </li>
        <li>
          <strong>Service data:</strong> time entries, client records, invoices,
          and related metadata you create within the Service
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type, device
          information, and anonymised usage analytics
        </li>
        <li>
          <strong>Authentication data:</strong> two-factor authentication
          method, encrypted TOTP secrets, and one-time codes (used only for
          account security)
        </li>
      </ul>

      <h3>3. Lawful Basis for Processing</h3>
      <p>
        Under the UK General Data Protection Regulation (UK GDPR), we process
        your personal data on the following lawful bases:
      </p>
      <ul>
        <li>
          <strong>Performance of a contract</strong> (Art. 6(1)(b)): processing
          your account, business, service, and authentication data is necessary
          to provide the Service to you
        </li>
        <li>
          <strong>Legitimate interests</strong> (Art. 6(1)(f)): processing
          technical data for security monitoring, fraud prevention, and service
          improvement, where our interests do not override your rights
        </li>
        <li>
          <strong>Legal obligation</strong> (Art. 6(1)(c)): retaining financial
          records as required by HMRC and applicable tax legislation
        </li>
        <li>
          <strong>Consent</strong> (Art. 6(1)(a)): where we send you optional
          communications or use non-essential cookies. You may withdraw consent
          at any time without affecting the lawfulness of processing carried out
          before withdrawal
        </li>
      </ul>

      <h3>4. How We Use Your Data</h3>
      <p>We use your data for the following purposes:</p>
      <ul>
        <li>Providing, operating, and maintaining the Service</li>
        <li>Processing and generating invoices on your behalf</li>
        <li>
          Sending transactional emails (password resets, two-factor
          authentication codes, account notifications)
        </li>
        <li>Improving the Service through anonymised usage analytics</li>
        <li>Ensuring security and preventing fraud or unauthorised access</li>
        <li>Complying with legal and regulatory obligations</li>
      </ul>

      <h3>5. Data Storage &amp; Security</h3>
      <p>
        Your data is stored securely using managed database services. We
        implement appropriate technical and organisational measures including:
      </p>
      <ul>
        <li>Encryption in transit (TLS/HTTPS) for all connections</li>
        <li>Encryption at rest for stored data</li>
        <li>Passwords hashed using bcrypt and never stored in plain text</li>
        <li>Two-factor authentication secrets encrypted before storage</li>
        <li>Regular security reviews and updates</li>
      </ul>

      <h3>6. Third-Party Services &amp; Sub-processors</h3>
      <p>
        We share personal data with the following third-party service providers
        (sub-processors), strictly as necessary to operate the Service:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> (Vercel Inc., USA): application hosting and
          serverless infrastructure
        </li>
        <li>
          <strong>Neon</strong> (Neon Inc., USA): managed PostgreSQL database
        </li>
        <li>
          <strong>Resend</strong> (Resend Inc., USA): transactional email
          delivery (password resets, 2FA codes)
        </li>
      </ul>
      <p>
        We do not sell, rent, or trade your personal data. We do not share your
        data with advertisers or for marketing purposes.
      </p>

      <h3>7. International Data Transfers</h3>
      <p>
        Some of our third-party service providers are based in the United
        States. Where personal data is transferred outside the United Kingdom,
        we ensure appropriate safeguards are in place, including:
      </p>
      <ul>
        <li>
          Standard Contractual Clauses (SCCs) approved by the UK Information
          Commissioner&rsquo;s Office (ICO)
        </li>
        <li>
          The UK&rsquo;s international data transfer agreement (IDTA) or
          addendum where applicable
        </li>
        <li>
          Ensuring the recipient provides a level of data protection that is not
          materially lower than under UK law
        </li>
      </ul>

      <h3>8. Cookies</h3>
      <p>We use the following categories of cookies:</p>
      <ul>
        <li>
          <strong>Strictly necessary cookies:</strong> required for
          authentication and session management. These cannot be disabled as the
          Service will not function without them.
        </li>
        <li>
          <strong>Analytics cookies:</strong> anonymised usage analytics (Vercel
          Web Analytics) to help us understand how the Service is used. These do
          not track individual users or use personal identifiers.
        </li>
      </ul>
      <p>
        We do not use advertising, marketing, or third-party tracking cookies.
      </p>

      <h3>9. Your Rights</h3>
      <p>
        Under the UK GDPR, you have the following rights regarding your personal
        data:
      </p>
      <ul>
        <li>
          <strong>Right of access</strong> (Art. 15): request a copy of the
          personal data we hold about you
        </li>
        <li>
          <strong>Right to rectification</strong> (Art. 16): request correction
          of inaccurate or incomplete data
        </li>
        <li>
          <strong>Right to erasure</strong> (Art. 17): request deletion of your
          personal data (subject to legal retention requirements)
        </li>
        <li>
          <strong>Right to restrict processing</strong> (Art. 18): request that
          we limit how we use your data in certain circumstances
        </li>
        <li>
          <strong>Right to data portability</strong> (Art. 20): receive your
          data in a structured, commonly used, machine-readable format
        </li>
        <li>
          <strong>Right to object</strong> (Art. 21): object to processing based
          on legitimate interests
        </li>
        <li>
          <strong>Rights related to automated decision-making</strong> (Art.
          22): we do not make automated decisions that produce legal effects
          concerning you
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <strong>contact@harryj.dev</strong>. We will respond to your request
        within one month, as required by law. We may ask you to verify your
        identity before processing your request.
      </p>

      <h3>10. Right to Complain</h3>
      <p>
        If you are unhappy with how we handle your personal data, you have the
        right to lodge a complaint with the UK&rsquo;s supervisory authority:
      </p>
      <p>
        <strong>Information Commissioner&rsquo;s Office (ICO)</strong>
        <br />
        Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF
        <br />
        Telephone: 0303 123 1113
        <br />
        Website: ico.org.uk
      </p>
      <p>
        We would appreciate the opportunity to address your concerns before you
        contact the ICO, so please reach out to us first.
      </p>

      <h3>11. Data Retention</h3>
      <p>We retain your data according to the following schedule:</p>
      <ul>
        <li>
          <strong>Account and profile data:</strong> retained for as long as
          your account is active, deleted within 30 days of account closure
        </li>
        <li>
          <strong>Financial records</strong> (invoices, billing data): retained
          for a minimum of 6 years after creation, as required by HMRC under UK
          tax legislation
        </li>
        <li>
          <strong>Technical logs:</strong> retained for up to 90 days for
          security and debugging purposes, then automatically deleted
        </li>
        <li>
          <strong>Authentication data</strong> (2FA secrets, backup codes):
          deleted immediately upon account closure or when 2FA is disabled
        </li>
      </ul>

      <h3>12. Children</h3>
      <p>
        The Service is intended for use by individuals aged 18 and over. We do
        not knowingly collect personal data from anyone under 18. If we become
        aware that we have collected data from a person under 18, we will delete
        it promptly.
      </p>

      <h3>13. Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of material changes by email or through the Service at least 30 days
        before they take effect. The &ldquo;last updated&rdquo; date at the top
        of this policy indicates when it was last revised.
      </p>

      <h3>14. Contact</h3>
      <p>
        If you have questions about this Privacy Policy or wish to exercise your
        data protection rights, please contact us at:
      </p>
      <p>
        Email: <strong>contact@harryj.dev</strong>
      </p>
    </div>
  );
}
