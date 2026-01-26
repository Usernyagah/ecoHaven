import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-stone-50">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800">Get in Touch</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                        Questions about our materials? Need help with an order? Our team is rooted in support and ready to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="bg-white p-3 rounded-full shadow-sm border border-stone-100">
                                <Mail className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-stone-800 mb-1">Email Us</h3>
                                <p className="text-sm text-stone-500">hello@ecohaven.com</p>
                                <p className="text-sm text-stone-500">support@ecohaven.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="bg-white p-3 rounded-full shadow-sm border border-stone-100">
                                <Phone className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-stone-800 mb-1">Call Us</h3>
                                <p className="text-sm text-stone-500">+1 (555) 000-GREEN</p>
                                <p className="text-sm text-stone-500">Mon-Fri: 9am - 5pm EST</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="bg-white p-3 rounded-full shadow-sm border border-stone-100">
                                <MapPin className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-stone-800 mb-1">Visit Our Studio</h3>
                                <p className="text-sm text-stone-500">123 Sage Avenue</p>
                                <p className="text-sm text-stone-500">Portland, OR 97201</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2 bg-white p-10 border border-stone-100 shadow-sm">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-stone-700">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        className="w-full p-3 bg-stone-50 border border-stone-100 focus:outline-none focus:border-[#8A9A5B] transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-stone-700">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="jane@example.com"
                                        className="w-full p-3 bg-stone-50 border border-stone-100 focus:outline-none focus:border-[#8A9A5B] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-700">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Ordering Inquiry"
                                    className="w-full p-3 bg-stone-50 border border-stone-100 focus:outline-none focus:border-[#8A9A5B] transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-700">Message</label>
                                <textarea
                                    rows={6}
                                    placeholder="Tell us more about how we can help..."
                                    className="w-full p-3 bg-stone-50 border border-stone-100 focus:outline-none focus:border-[#8A9A5B] transition-colors resize-none"
                                />
                            </div>

                            <Button className="w-full md:w-auto bg-[#8A9A5B] hover:bg-[#5A6A3B] text-white px-10 py-6 rounded-none font-medium text-base group">
                                Send Message
                                <Send className="ml-3 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
