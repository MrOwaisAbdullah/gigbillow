
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-secondary/30">
        <div className="container mx-auto py-12 md:py-24 lg:py-32 px-4 md:px-6">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </CardHeader>
            <CardContent className="space-y-6">
            <p className="leading-relaxed text-muted-foreground">
                Welcome to GigBillow. We are committed to protecting your privacy. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <div>
                <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                <p className="leading-relaxed text-muted-foreground">We may collect information about you in a variety of ways. The information we may collect includes:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 pl-4 text-muted-foreground">
                    <li>
                        <strong className="font-semibold text-foreground">Personal Data:</strong> Personally identifiable information, such as your name, email address,
                        and profile picture, that you voluntarily give to us when you register with the Application.
                    </li>
                    <li>
                        <strong className="font-semibold text-foreground">Derivative Data:</strong> Information our servers automatically collect when you access the
                        Application, such as your IP address, your browser type, your operating system, your access times, and the
                        pages you have viewed directly before and after accessing the Application.
                    </li>
                    <li>
                        <strong className="font-semibold text-foreground">Financial Data:</strong> We do not directly collect or store any payment card details. All
                        payments are processed through a third-party payment processor (e.g., Stripe), and you should review
                        their privacy policy. We may receive information about the transaction, such as the date and amount paid.
                    </li>
                    <li>
                        <strong className="font-semibold text-foreground">Application Data:</strong> We store data that you create within the application, such as clients,
                        projects, time entries, invoices, and expenses. This data is necessary for the application to function
                        and is stored securely in our database (Firebase Firestore).
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">2. Use of Your Information</h2>
                <p className="leading-relaxed text-muted-foreground">
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized
                    experience. Specifically, we may use information collected about you via the Application to:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2 pl-4 text-muted-foreground">
                    <li>Create and manage your account.</li>
                    <li>Process payments and refunds.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Application.</li>
                    <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">3. Disclosure of Your Information</h2>
                <p className="leading-relaxed text-muted-foreground">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 pl-4 text-muted-foreground">
                    <li>
                        <strong className="font-semibold text-foreground">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary
                        to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the
                        rights, property, and safety of others, we may share your information as permitted or required by any applicable law.
                    </li>
                    <li>
                        <strong className="font-semibold text-foreground">Third-Party Service Providers:</strong> We may share your information with third parties that perform
                        services for us or on our behalf, including payment processing (Stripe), data analysis (Google Analytics),
                        and email delivery (Firebase).
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">4. Security of Your Information</h2>
                <p className="leading-relaxed text-muted-foreground">
                    We use administrative, technical, and physical security measures to help protect your personal information.
                    We use Google Cloud and Firebase for our infrastructure, which provides industry-standard security for
                    data storage and authentication. While we have taken reasonable steps to secure the personal information you
                    provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and
                    no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
            </div>
            
            <div>
                <h2 className="text-xl font-semibold mb-2">5. Policy for Children</h2>
                <p className="leading-relaxed text-muted-foreground">
                    We do not knowingly solicit information from or market to children under the age of 13. If you become
                    aware of any data we have collected from children under age 13, please contact us using the contact
                    information provided below.
                </p>
            </div>

            <div>
                 <h2 className="text-xl font-semibold mb-2">6. Your Data Rights</h2>
                 <p className="leading-relaxed text-muted-foreground">
                    You have the right to request access to the personal data we hold about you, to have any inaccuracies
                    corrected, and to request the deletion of your personal data. You can manage your profile information
                    from your account settings. For a full data deletion request, please contact us.
                </p>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
                <p className="leading-relaxed text-muted-foreground">
                    If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:support@gigbillow.com" className="text-primary hover:underline">support@gigbillow.com</a>.
                </p>
            </div>
            <div className="text-center mt-8">
                <Link href="/" className="text-primary hover:underline">
                    &larr; Back to Home
                </Link>
            </div>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
