# Publishing harsh.contact

The site is a static `index.html` and has no build step. The `CNAME` file declares `harsh.contact` as its GitHub Pages custom domain.

1. Review and merge the portfolio pull request.
2. In repository Settings → Pages, select **Deploy from a branch**, `main`, and `/ (root)`, if Pages is available for this repository.
3. Set the custom domain to `harsh.contact` in Pages settings, and verify the DNS records at the domain provider point to GitHub Pages. Do not add a Squarespace Defaults preset while hosting with GitHub Pages.
4. Wait for the Pages deployment and DNS propagation, then verify `https://harsh.contact` loads with a valid certificate on desktop and mobile.

The existing live domain showed a certificate hostname mismatch and a 502 response during development, so hosting setup needs separate verification. This PR does not change DNS or repository settings.
