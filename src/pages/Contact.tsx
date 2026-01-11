import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  message: z.string().min(1, "Message is required").max(1000),
});

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      contactSchema.parse({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      const { error } = await supabase.from("contact_inquiries").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke(
        "send-contact-notification",
        {
          body: {
            type: "contact",
            data: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              message: formData.message,
            },
          },
        }
      );

      if (emailError) {
        console.error("Email notification error:", emailError);
      }

      toast.success(t('common.success'));
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('contact.ourLocation')}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t('contact.locationValue')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('contact.phone')}</h3>
                    <p className="text-muted-foreground text-sm">
                      +91 9988322555 ({t('common.whatsapp')})<br />
                      +91 9789225510<br />
                      +91 421-6610850
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('contact.email')}</h3>
                    <a 
                      href="mailto:hello@featherfashions.in"
                      className="text-sm font-semibold text-primary hover:text-secondary transition-colors duration-200 underline decoration-primary/30 hover:decoration-secondary break-all block"
                    >
                      hello@featherfashions.in
                    </a>
                    <a 
                      href="mailto:info@featherfashions.in"
                      className="text-sm font-semibold text-primary hover:text-secondary transition-colors duration-200 underline decoration-primary/30 hover:decoration-secondary break-all block"
                    >
                      info@featherfashions.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {t('contact.workingHours')}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t('contact.workingHoursValue')}
                      <br />
                      {t('contact.sundayClosed')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-accent text-white border-0">
              <CardContent className="p-6">
                <MessageCircle className="h-10 w-10 mb-3" />
                <h3 className="font-accent font-semibold text-xl mb-2">
                  {t('contact.quickResponse')}
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  {t('contact.quickResponseDescription')}
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-white/20 border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => window.open("https://wa.me/919988322555?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank")}
                >
                  {t('contact.chatOnWhatsapp')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">{t('contact.sendMessage')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-base font-semibold mb-2 block"
                      >
                        {t('contact.yourName')} *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('contact.enterFullName')}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold mb-2 block"
                      >
                        {t('contact.emailAddress')} *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('contact.emailPlaceholder')}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-base font-semibold mb-2 block"
                    >
                      {t('contact.phoneNumber')}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contact.phonePlaceholder')}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="message"
                      className="text-base font-semibold mb-2 block"
                    >
                      {t('contact.yourMessage')} *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder={t('contact.messagePlaceholder')}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-lg h-14"
                  >
                    {t('contact.sendMessageButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4592.984969361314!2d77.34966020867435!3d11.150001950571243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9075eb1b09dff%3A0xbb8c06a6e1105594!2sFeather%20Fashions!5e1!3m2!1sen!2sin!4v1762583423056!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Feather Fashions Location - Tirupur, Tamil Nadu"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
