import { Helmet } from "react-helmet";
import { FileText, Scale, ShoppingBag, AlertCircle, CheckCircle } from "lucide-react";

const TermsAndConditions = () => {
  const termsOfUse = [
    "To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account on the Platform.",
    "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
    "Your use of our Services and the Platform is solely and entirely at your own risk and discretion for which we shall not be liable to you in any manner. You are required to independently assess and ensure that the Services meet your requirements.",
    "The contents of the Platform and the Services are proprietary to us and are licensed to us. You will not have any authority to claim any intellectual property rights, title, or interest in its contents. The contents includes and is not limited to the design, layout, look and graphics.",
    "You acknowledge that unauthorized use of the Platform and/or the Services may lead to action against you as per these Terms of Use and/or applicable laws.",
    "You agree to pay us the charges associated with availing the Services.",
    "You agree not to use the Platform and/or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.",
    "You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites. These links are provided for your convenience for provide further information.",
    "You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the Platform Owner for the Services."
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms and Conditions | Feather Fashions</title>
        <meta name="description" content="Terms and Conditions for using Feather Fashions website and services." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-[#0A0A0A] text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-6 animate-fade-in">
            Legal
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Please read these terms carefully before using our platform and services.
          </p>
        </div>
      </section>

      {/* Introduction Cards */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-6">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-playfair text-xl text-[#0A0A0A] mb-4">Electronic Record</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-6">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-playfair text-xl text-[#0A0A0A] mb-4">Legal Compliance</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011 that require publishing the rules and regulations, privacy policy and Terms of Use.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="font-playfair text-2xl text-[#0A0A0A] mb-6">About the Platform</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Platform is owned by FEATHER FASHIONS, a company incorporated under the Companies Act, 1956 with its registered office at 2511, Tiruppur Vadivel Nagar, Tirupur, India (hereinafter referred to as 'Platform Owner', 'we', 'us', 'our').
              </p>
              <p>
                Your use of the Platform and services and tools are governed by the following terms and conditions ("Terms of Use") as applicable to the Platform including the applicable policies which are incorporated herein by way of reference.
              </p>
              <p>
                By mere use of the Platform, You shall be contracting with the Platform Owner and these terms and conditions including the policies constitute Your binding obligations, with Platform Owner.
              </p>
              <p>
                These Terms of Use can be modified at any time without assigning any reason. It is your responsibility to periodically review these Terms of Use to stay informed of updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 md:p-10 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-playfair text-xl text-amber-800 mb-3">Important Notice</h3>
                <p className="text-amber-700 leading-relaxed font-medium">
                  ACCESSING, BROWSING OR OTHERWISE USING THE PLATFORM INDICATES YOUR AGREEMENT TO ALL THE TERMS AND CONDITIONS UNDER THESE TERMS OF USE, SO PLEASE READ THE TERMS OF USE CAREFULLY BEFORE PROCEEDING.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Use Section */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-[#0A0A0A] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl text-[#0A0A0A]">Use of Platform and Services</h2>
              <p className="text-gray-500 mt-1">The use of Platform and/or availing of our Services is subject to the following Terms of Use</p>
            </div>
          </div>

          <div className="space-y-6">
            {termsOfUse.map((term, index) => (
              <div 
                key={index} 
                className="group flex gap-5 p-6 bg-[#FAFAF8] rounded-xl hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 text-[#0A0A0A]" />
                </div>
                <p className="text-gray-600 leading-relaxed">{term}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Definition Section */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-playfair text-2xl md:text-3xl text-[#0A0A0A] text-center mb-10">Definitions</h2>
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
            <p className="text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
              For the purpose of these Terms of Use, wherever the context so requires <span className="text-[#0A0A0A] font-medium">'you'</span>, <span className="text-[#0A0A0A] font-medium">'your'</span> or <span className="text-[#0A0A0A] font-medium">'user'</span> shall mean any natural or legal person who has agreed to become a user/buyer on the Platform.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Last Updated
          </p>
          <p className="text-white/60 text-lg mb-8">
            These Terms and Conditions were last updated on December 2024
          </p>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">
            These Terms of Use relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, 'Services'). Any terms and conditions proposed by You which are in addition to or which conflict with these Terms of Use are expressly rejected by the Platform Owner.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
