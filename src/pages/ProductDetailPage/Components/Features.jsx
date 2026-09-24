import React from "react";

// Fixed the capitalization in the import path (classic-fit.png instead of classic-FIT.png)
import classic from "../../../assets/icons/classic-fit.png";
import pocket from "../../../assets/icons/pocket.png";
import water from "../../../assets/icons/water.png";
import iron from "../../../assets/icons/iron.png";

const ProductFeatures = () => {
  const features = [
    {
      icon: classic,
      title: "CLASSIC FIT"
    },
    {
      icon: pocket,
      title: "12 POCKETS"
    },
    {
      icon: water,
      title: "WATER RESISTANT"
    },
    {
      icon: iron,
      title: "ANTI-WRINKLE"
    }
  ];

  return (
    <section className="w-full bg-paper py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-center justify-items-center relative">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center justify-center w-full relative">
              <div className="mb-4">
                <img 
                  src={feature.icon || "/placeholder.svg"} 
                  alt={feature.title} 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-flannel text-sm font-medium tracking-wider text-center">
                {feature.title}
              </h3>
              {index < features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-gray-300" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeatures;