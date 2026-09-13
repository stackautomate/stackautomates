// Mobile menu toggle - works on every page
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

const sitePrefix = window.location.pathname.includes('/solutions/') ? '../' : '';
const contactPath = `${sitePrefix}contact.html`;
const dataDeletionPath = `${sitePrefix}data-deletion.html`;
const legalDisclaimerPath = `${sitePrefix}legal-disclaimer.html`;

document.querySelectorAll('a[href$="contact-us.html"]').forEach(link => {
  link.href = contactPath;
});

if (navLinks && !navLinks.querySelector(`a[href="${contactPath}"]`)) {
  const contactLink = document.createElement('a');
  contactLink.href = contactPath;
  contactLink.textContent = 'Contact';
  const dropdowns = navLinks.querySelectorAll('.nav-dropdown');
  const lastDropdown = dropdowns[dropdowns.length - 1];
  const mobileMenu = navLinks.querySelector('.mobile-menu-items');
  if (lastDropdown) {
    navLinks.insertBefore(contactLink, lastDropdown.nextSibling);
  } else if (mobileMenu) {
    navLinks.insertBefore(contactLink, mobileMenu);
  } else {
    navLinks.appendChild(contactLink);
  }
}

const companyFooter = [...document.querySelectorAll('.footer-col')].find(column => column.querySelector('h4')?.textContent.trim() === 'Company');
if (companyFooter) {
  const companyLinks = companyFooter.querySelector('ul');
  if (companyLinks) {
    const complianceLinks = [
      ['Privacy Policy', `${sitePrefix}privacy-policy.html`],
      ['Data Deletion Request', dataDeletionPath],
      ['Legal Disclaimer', legalDisclaimerPath],
      ['Contact Us', contactPath]
    ];
    complianceLinks.forEach(([label, href]) => {
      if (!companyLinks.querySelector(`a[href="${href}"]`)) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        item.appendChild(link);
        companyLinks.appendChild(item);
      }
    });
  }
}

document.querySelectorAll('.footer-bottom').forEach(footerBottom => {
  const footerLegal = footerBottom.querySelector('.footer-legal');
  if (footerLegal) footerLegal.remove();
});

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  navOverlay.classList.toggle('active');
});

navOverlay.addEventListener('click', () => {
  menuToggle.classList.remove('active');
  navLinks.classList.remove('active');
  navOverlay.classList.remove('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
  });
});