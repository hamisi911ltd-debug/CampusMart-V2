import { Search, BookOpen, Laptop, Shirt, Utensils, Key, PenTool, Armchair } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/shared";
import { useListProducts } from "@workspace/api-client-react";

const CATEGORIES = [
  { name: "Books", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
  { name: "Electronics", icon: Laptop, color: "bg-purple-100 text-purple-600" },
  { name: "Fashion", icon: Shirt, color: "bg-pink-100 text-pink-600" },
  { name: "Food", icon: Utensils, color: "bg-orange-100 text-orange-600" },
  { name: "Nrooms", icon: Key, color: "bg-green-100 text-green-600" },
  { name: "Stationery", icon: PenTool, color: "bg-yellow-100 text-yellow-600" },
  { name: "Furniture", icon: Armchair, color: "bg-amber-100 text-amber-600" },
];

export default function Home() {
  const { data: featuredData, isLoading } = useListProducts({ featured: true });

  const banners = [
    { image: `${import.meta.env.BASE_URL}images/hero-textbooks.png`, title: "Cheap Textbooks", tag: "MARKET" },
    { image: `${import.meta.env.BASE_URL}images/hero-rooms.png`, title: "Find a Room", tag: "NROOMS" },
    { image: `${import.meta.env.BASE_URL}images/hero-food.png`, title: "Late Night Bites", tag: "FOOD" }
  ];

  return (
    <div className="pb-8">
      <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-8 mt-4 md:mt-6">
        {/* Mobile Search */}
        <div className="md:hidden relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search products, food, rooms..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-border/80 shadow-sm rounded-2xl focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-base"
          />
        </div>

        {/* Hero Carousel */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-primary/5 bg-muted group">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[21/9] md:aspect-[21/7]">
            {banners.map((banner, i) => (
              <div key={i} className="min-w-full h-full snap-center relative shrink-0">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold rounded-md mb-3 w-max">
                    {banner.tag}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 shadow-black/20 text-shadow-sm">
                    {banner.title}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <section>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.name} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${cat.color} group-hover:scale-105 group-hover:shadow-md transition-all duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Trending Near You</h2>
            <Link href="/market" className="text-sm font-semibold text-secondary hover:underline">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : featuredData?.products?.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredData.products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground">No trending products found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
