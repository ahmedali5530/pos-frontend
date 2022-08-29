import React from "react";

export const Footer = () => {
  return (
    <div className="bg-footer mt-5">
      <div className="p-5">
        <div className="row">
          <div className="col-12 col-md-3">
            <div className="footer-links">
              <h3>Do you have questions?</h3>
              <h3> Call or visit us.</h3>
              <div className="ft-phone">
                <a href="tel:+ (231) 777432694">+ (231) 777432694</a>
              </div>
              <p className="pt-2">
                Duport Road, Paynesville, Liberia
              </p>
              <p className="pt-2">
                <a href="mailto:info@liberrands.com">info@liberrands.com</a>
              </p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="footer-links">
              <h3>Useful Links</h3>
              <ul className="list-unstyled">
                <li>
                  About Us
                </li>
                <li>
                  Pricing
                </li>
                <li>
                  Privacy Policy
                </li>
                <li>
                  Terms & Conditions
                </li>
                <li>
                  Cookies Policy
                </li>
              </ul>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="footer-links">
              <ul className="list-unstyled">
                <li>
                  Disclaimer
                </li>
                <li>
                  Contact
                </li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <h3>Connect With Us</h3>
            <p>Join us on Our Social Platforms for latest news & Updates</p>
            <ul className="social-network social-circle list-unstyled text-white list-inline">
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>
          <div className="col-12 my-5">
            <div className="footer-bottom text-center">
              Copyright 2021 <a href="//liberrands.com">liberrands.com</a> All Rights Reserved | Developed by: <a href="//:smilesolutionslib.com">Smile Solutions, Inc.</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};