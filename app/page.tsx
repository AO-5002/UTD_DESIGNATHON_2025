"use client";
import LandingLayout from "@/layouts/LandingLayout";

// Button Component
type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
};

function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className={`relative w-[360px] h-[100px] group ${className}`}
    >
      <div
        className={`absolute inset-0 rounded-[50px] transition-transform group-hover:scale-105 ${
          isPrimary
            ? "bg-black"
            : "border-2 border-black group-hover:bg-black/5"
        }`}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center font-medium text-[var(--font-size-body-md)] ${
          isPrimary ? "text-white" : "text-black"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

// Decorative Shape Component
type DecorativeShapeProps = {
  color: string;
  className?: string;
  rounded?: boolean;
};

function DecorativeShape({
  color,
  className = "",
  rounded = false,
}: DecorativeShapeProps) {
  return (
    <div
      className={`${className} ${rounded ? "rounded-full" : ""}`}
      style={{ backgroundColor: color }}
    />
  );
}

// Hero Section Component
type HeroSectionProps = {
  title: string;
  subtitle?: string;
  description: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

function HeroSection({
  title,
  subtitle,
  description,
  primaryButtonText = "Get Started",
  secondaryButtonText = "Learn More",
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
  return (
    <section className="relative">
      {/* Decorative Elements */}
      <DecorativeShape
        color="#ffd7d7"
        className="absolute top-32 left-0 w-[640px] h-[120px] -z-10"
      />
      <DecorativeShape
        color="#ffce5d"
        className="absolute top-16 right-32 w-[160px] h-[160px] -z-10"
        rounded
      />

      {/* Hero Heading */}
      <h1 className="font-black leading-tight mb-12 max-w-4xl">
        {title}
        {subtitle && (
          <>
            <br />
            {subtitle}
          </>
        )}
      </h1>

      {/* Hero Description */}
      <p className="text-[var(--font-size-body-md)] font-medium max-w-6xl mb-16 leading-relaxed">
        {description}
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-8">
        <Button variant="primary" onClick={onPrimaryClick}>
          {primaryButtonText}
        </Button>
        <Button variant="secondary" onClick={onSecondaryClick}>
          {secondaryButtonText}
        </Button>
      </div>
    </section>
  );
}

// Feature Card Component
type FeatureCardProps = {
  title: string;
  description?: string;
  backgroundColor: string;
  shadowColor: string;
  className?: string;
};

function FeatureCard({
  title,
  description,
  backgroundColor,
  shadowColor,
  className = "",
}: FeatureCardProps) {
  return (
    <div className={`relative h-[400px] ${className}`}>
      {/* Shadow Layer */}
      <div
        className="absolute inset-0 rounded-[50px] translate-x-3 translate-y-3"
        style={{ backgroundColor: shadowColor }}
      />
      {/* Main Card */}
      <div
        className="relative h-full rounded-[50px] border-2 border-black p-8 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg"
        style={{ backgroundColor }}
      >
        <div className="">
          <h3 className="text-[var(--font-size-body-md)] font-bold mb-4">
            {title}
          </h3>
          {description && (
            <p className="text-[var(--font-size-small)] font-medium opacity-80">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Features Section Component
type FeaturesSectionProps = {
  title: string;
  subtitle?: string;
  features: Array<{
    title: string;
    description?: string;
    backgroundColor: string;
    shadowColor: string;
  }>;
};

function FeaturesSection({ title, subtitle, features }: FeaturesSectionProps) {
  return (
    <section className="relative">
      <div className="flex flex-col gap-4 mb-24">
        <h2 className="font-black leading-tight max-w-3xl">{title}</h2>
        <h2>{subtitle}</h2>
      </div>

      <div className="grid grid-cols-3 gap-12">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            backgroundColor={feature.backgroundColor}
            shadowColor={feature.shadowColor}
          />
        ))}
      </div>
    </section>
  );
}

// Main Page Component
export default function Home() {
  const features = [
    {
      title: "Collaborate",
      description: "Work together seamlessly with your team in real-time",
      backgroundColor: "#bacded",
      shadowColor: "#5077b8",
    },
    {
      title: "Connect",
      description: "Build meaningful relationships across your organization",
      backgroundColor: "#ddedab",
      shadowColor: "#8fb225",
    },
    {
      title: "Create",
      description: "Express yourself with AI-curated digital patches",
      backgroundColor: "#ffd7d7",
      shadowColor: "#ff8b8b",
    },
  ];

  return (
    <LandingLayout>
      <div className="relative w-full py-16 space-y-32">
        <HeroSection
          title="Stop scattering."
          subtitle="Start solving."
          description="Introducing PatchWork—the living digital wall that transforms hybrid teams into a connected community. We replace scattered emails and stressful check-ins with expressive, AI-curated patches that build a collective tapestry of wellbeing and ideas. PatchWork is the feeling of belonging, digitized for the modern workplace."
          primaryButtonText="Get Started"
          secondaryButtonText="Learn More"
          onPrimaryClick={() => console.log("Primary clicked")}
          onSecondaryClick={() => console.log("Secondary clicked")}
        />

        <FeaturesSection
          title={`Stop scrolling. `}
          subtitle="Start stitching."
          features={features}
        />
      </div>
    </LandingLayout>
  );
}
