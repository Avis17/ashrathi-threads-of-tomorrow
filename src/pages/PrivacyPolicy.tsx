import { Helmet } from "react-helmet";
import { Shield, Eye, Share2, Lock, Trash2, UserCheck, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Eye,
      title: "Collection",
      content: [
        "We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship and related information provided from time to time.",
        "Some of the information that we may collect includes but is not limited to personal data / information provided to us during sign-up/registering or using our Platform such as name, date of birth, address, telephone/mobile number, email ID and/or any such information shared as proof of identity or address.",
        "Some of the sensitive personal data may be collected with your consent, such as your bank account or credit or debit card or other payment instrument information or biometric information such as your facial features or physiological information (in order to enable use of certain features when opted for, available on the Platform) etc all of the above being in accordance with applicable law(s).",
        "You always have the option to not provide information, by choosing not to use a particular service or feature on the Platform. We may track your behaviour, preferences, and other information that you choose to provide on our Platform. This information is compiled and analysed on an aggregated basis.",
        "We will also collect your information related to your transactions on Platform and such third-party business partner platforms. When such a third-party business partner collects your personal data directly from you, you will be governed by their privacy policies."
      ]
    },
    {
      icon: Shield,
      title: "Usage",
      content: [
        "We use personal data to provide the services you request. To the extent we use your personal data to market to you, we will provide you the ability to opt-out of such uses.",
        "We use your personal data to assist sellers and business partners in handling and fulfilling orders; enhancing customer experience; to resolve disputes; troubleshoot problems; inform you about online and offline offers, products, services, and updates; customise your experience; detect and protect us against error, fraud and other criminal activity; enforce our terms and conditions; conduct marketing research, analysis and surveys; and as otherwise described to you at the time of collection of information.",
        "You understand that your access to these products/services may be affected in the event permission is not provided to us."
      ]
    },
    {
      icon: Share2,
      title: "Sharing",
      content: [
        "We may share your personal data internally within our group entities, our other corporate entities, and affiliates to provide you access to the services and products offered by them. These entities and affiliates may market to you as a result of such sharing unless you explicitly opt-out.",
        "We may disclose personal data to third parties such as sellers, business partners, third party service providers including logistics partners, prepaid payment instrument issuers, third-party reward programs and other payment opted by you.",
        "We may disclose personal and sensitive personal data to government agencies or other authorised law enforcement agencies if required to do so by law or in the good faith belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or other legal process.",
        "We may disclose personal data to law enforcement offices, third party rights owners, or others in the good faith belief that such disclosure is reasonably necessary to: enforce our Terms of Use or Privacy Policy; respond to claims that an advertisement, posting or other content violates the rights of a third party; or protect the rights, property or personal safety of our users or the general public."
      ]
    },
    {
      icon: Lock,
      title: "Security Precautions",
      content: [
        "To protect your personal data from unauthorised access or disclosure, loss or misuse we adopt reasonable security practices and procedures. Once your information is in our possession or whenever you access your account information, we adhere to our security guidelines to protect it against unauthorised access and offer the use of a secure server.",
        "However, the transmission of information is not completely secure for reasons beyond our control. By using the Platform, the users accept the security implications of data transmission over the internet and the World Wide Web which cannot always be guaranteed as completely secure, and therefore, there would always remain certain inherent risks regarding use of the Platform. Users are responsible for ensuring the protection of login and password records for their account."
      ]
    },
    {
      icon: Trash2,
      title: "Data Deletion and Retention",
      content: [
        "You have an option to delete your account by visiting your profile and settings on our Platform, this action would result in you losing all information related to your account. You may also write to us at the contact information provided below to assist you with these requests.",
        "We may in event of any pending grievance, claims, pending shipments or any other services we may refuse or delay deletion of the account. Once the account is deleted, you will lose access to the account.",
        "We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law. However, we may retain data related to you if we believe it may be necessary to prevent fraud or future abuse or for other legitimate purposes. We may continue to retain your data in anonymised form for analytical and research purposes."
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        "You may access, rectify, and update your personal data directly through the functionalities provided on the Platform."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | Feather Fashions</title>
        <meta name="description" content="Privacy Policy for Feather Fashions - Learn how we collect, use, and protect your personal data." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-[#0A0A0A] text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-6 animate-fade-in">
            Legal
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <p className="text-gray-600 leading-relaxed mb-6">
              This Privacy Policy describes how FEATHER FASHIONS and its affiliates (collectively "FEATHER FASHIONS, we, our, us") collect, use, share, protect or otherwise process your information/ personal data through our website https://featherfashions.in/ (hereinafter referred to as Platform).
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Please note that you may be able to browse certain sections of the Platform without registering with us. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree to be governed by the laws of India including but not limited to the laws applicable to data protection and privacy. If you do not agree please do not use or access our Platform.
            </p>
          </div>
        </div>
      </section>

      {/* Warning Box */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-10 border border-red-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-playfair text-xl text-red-800 mb-3">Important Security Notice</h3>
                <p className="text-red-700 leading-relaxed">
                  If you receive an email, a call from a person/association claiming to be FEATHER FASHIONS seeking any personal data like debit/credit card PIN, net-banking or mobile banking password, we request you to <strong>never provide such information</strong>. If you have already revealed such information, report it immediately to an appropriate law enforcement agency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="group">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors duration-500">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-playfair text-2xl md:text-3xl text-[#0A0A0A] mb-6">{section.title}</h2>
                  <div className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              {index < sections.length - 1 && (
                <div className="border-b border-gray-100 mt-12" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Last Updated
          </p>
          <p className="text-white/60 text-lg">
            This Privacy Policy was last updated on December 2024
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
