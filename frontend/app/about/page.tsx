import { Leaf, Globe, ShieldCheck, Heart } from "lucide-react"

export default function AboutPage() {
    const values = [
        {
            icon: <Globe className="h-8 w-8 text-[#8A9A5B]" />,
            title: "Ethically Sourced",
            description: "We partner directly with artisans and sustainable farms to ensure fair wages and transparent supply chains."
        },
        {
            icon: <ShieldCheck className="h-8 w-8 text-[#8A9A5B]" />,
            title: "Zero Waste",
            description: "From our products to our packaging, we strive for a circular economy that leaves no footprint behind."
        },
        {
            icon: <Heart className="h-8 w-8 text-[#8A9A5B]" />,
            title: "Community First",
            description: "A portion of every sale goes toward environmental restoration projects and local ecological education."
        }
    ]

    return (
        <div className="min-h-screen bg-stone-50">

            <main>
                {/* Story Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#8A9A5B]">
                                <Leaf className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Our Story</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 leading-tight">
                                Crafting a Greener Tomorrow, One Conscious Choice at a Time.
                            </h1>
                            <p className="text-lg text-stone-600 leading-relaxed italic">
                                "We didn't inherit the Earth from our ancestors; we borrow it from our children."
                            </p>
                            <div className="space-y-4 text-stone-600 leading-relaxed">
                                <p>
                                    EcoHaven was born from a simple observation: it was too difficult to find high-quality,
                                    truly sustainable alternatives for every day living without spending hours researching
                                    supply chains.
                                </p>
                                <p>
                                    Founded in 2023, we curate the world’s most thoughtful sustainable goods. Every item in
                                    our catalog is vetted for environmental impact, durability, and aesthetic longevity.
                                    We believe that sustainability Shouldn't be a sacrifice in style or quality.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] bg-stone-200 rounded-sm overflow-hidden custom-shadow">
                                <img
                                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800"
                                    alt="Sustainable lifestyle"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-white p-8 border border-stone-100 hidden md:block max-w-xs shadow-xl">
                                <p className="font-serif text-xl font-bold text-stone-800 mb-2">100% Organic</p>
                                <p className="text-stone-500 text-sm">GOTS certified materials and plastic-free packaging guaranteed.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-stone-100 py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-stone-800">Rooted in Purpose</h2>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white p-10 text-center border border-stone-100 shadow-sm hover:translate-y-[-4px] transition-all">
                                <div className="mb-6 flex justify-center">{v.icon}</div>
                                <h3 className="text-xl font-serif font-bold text-stone-800 mb-4">{v.title}</h3>
                                <p className="text-stone-600 text-sm leading-loose">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
