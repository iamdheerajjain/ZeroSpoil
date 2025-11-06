import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HomeClient } from "@/components/home-client";
import {
  Leaf,
  Brain,
  MapPin,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveSection,
  ResponsiveText,
  FlexResponsive,
  ResponsiveSpacing,
} from "@/components/ui/responsive-grid";
import {
  ScrollReveal,
  FadeInUp,
  FadeInDown,
  StaggerContainer,
  StaggerItem,
  HoverCard,
} from "@/components/ui/motion";

export default function HomePage() {
  return (
    <HomeClient>
      <div className="min-h-screen">
        {/* Navigation */}
        <FadeInDown>
          <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md transition-all duration-300">
            <ResponsiveContainer
              size="xl"
              padding={{ default: 4, sm: 6, lg: 8 }}
            >
              <FlexResponsive
                justify="between"
                align="center"
                className="h-16 lg:h-20"
              >
                <FlexResponsive align="center" gap={3}>
                  <Leaf className="h-8 w-8 lg:h-10 lg:w-10 text-primary animate-bounce-gentle" />
                  <ResponsiveText
                    size={{ default: "xl", sm: "2xl", lg: "3xl" }}
                    weight="bold"
                    className="gradient-text"
                    as="span"
                  >
                    ZeroSpoil
                  </ResponsiveText>
                </FlexResponsive>
                <FlexResponsive gap={2} className="sm:gap-4">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:h-10 sm:px-4 sm:text-sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="sm:h-10 sm:px-4 sm:text-sm">
                      Get Started
                    </Button>
                  </Link>
                </FlexResponsive>
              </FlexResponsive>
            </ResponsiveContainer>
          </nav>
        </FadeInDown>

        {/* Hero Section */}
        <ResponsiveSection
          background="gradient"
          spacing={{ y: { default: 16, md: 20, lg: 24 } }}
          className="relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div
              className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-green-400/10 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse-gentle"></div>
          </div>

          <ResponsiveContainer size="xl" className="text-center relative z-10">
            <StaggerContainer>
              <StaggerItem>
                <ResponsiveText
                  size={{
                    default: "4xl",
                    sm: "5xl",
                    md: "6xl",
                    lg: "6xl",
                    xl: "6xl",
                  }}
                  weight="bold"
                  className="mb-4 sm:mb-6 tracking-tight leading-tight lg:text-7xl xl:text-8xl"
                  as="h1"
                >
                  Stop Food Waste with{" "}
                  <span className="gradient-text animate-gradient-shift bg-gradient-to-r from-primary via-blue-600 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto]">
                    Smart Technology
                  </span>
                </ResponsiveText>
              </StaggerItem>

              <StaggerItem>
                <ResponsiveText
                  size={{
                    default: "lg",
                    sm: "xl",
                    md: "2xl",
                    lg: "3xl",
                  }}
                  className="text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
                  as="p"
                >
                  Use AI-powered predictions, smart recipe suggestions, and
                  local donation connections to reduce food waste and save money
                  while helping your community.
                </ResponsiveText>
              </StaggerItem>

              <StaggerItem>
                <FlexResponsive
                  direction={{ default: "col", sm: "row" }}
                  justify="center"
                  gap={4}
                  className="mb-8 sm:mb-12"
                >
                  <Link href="/signup">
                    <Button
                      size="xl"
                      className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 shadow-glow hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Start Reducing Waste
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 backdrop-blur-sm hover:bg-white/50 transition-all duration-300"
                  >
                    Watch Demo
                  </Button>
                </FlexResponsive>
              </StaggerItem>
            </StaggerContainer>

            {/* Enhanced Stats */}
            <ScrollReveal delay={0.3}>
              <ResponsiveGrid
                cols={{ default: 1, md: 3 }}
                gap={{ default: 6, md: 8 }}
                className="mt-12 sm:mt-16 lg:mt-20"
              >
                <HoverCard className="text-center p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-soft">
                  <ResponsiveText
                    size={{ default: "4xl", sm: "5xl", md: "6xl" }}
                    weight="bold"
                    className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mb-3 animate-scale-in-bounce"
                    as="div"
                  >
                    40%
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "base", sm: "lg" }}
                    weight="medium"
                    className="text-gray-700"
                  >
                    Food Waste Reduction
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "xs", sm: "sm" }}
                    className="text-gray-500 mt-1"
                  >
                    Average user achievement
                  </ResponsiveText>
                </HoverCard>

                <HoverCard className="text-center p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-soft">
                  <ResponsiveText
                    size={{ default: "4xl", sm: "5xl", md: "6xl" }}
                    weight="bold"
                    className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3 animate-scale-in-bounce"
                    as="div"
                    style={{ animationDelay: "0.2s" }}
                  >
                    $1,500
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "base", sm: "lg" }}
                    weight="medium"
                    className="text-gray-700"
                  >
                    Average Annual Savings
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "xs", sm: "sm" }}
                    className="text-gray-500 mt-1"
                  >
                    Money saved per household
                  </ResponsiveText>
                </HoverCard>

                <HoverCard className="text-center p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-soft">
                  <ResponsiveText
                    size={{ default: "4xl", sm: "5xl", md: "6xl" }}
                    weight="bold"
                    className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-3 animate-scale-in-bounce"
                    as="div"
                    style={{ animationDelay: "0.4s" }}
                  >
                    50K+
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "base", sm: "lg" }}
                    weight="medium"
                    className="text-gray-700"
                  >
                    Meals Saved
                  </ResponsiveText>
                  <ResponsiveText
                    size={{ default: "xs", sm: "sm" }}
                    className="text-gray-500 mt-1"
                  >
                    Community impact to date
                  </ResponsiveText>
                </HoverCard>
              </ResponsiveGrid>
            </ScrollReveal>
          </ResponsiveContainer>
        </ResponsiveSection>

        {/* Features Section */}
        <ResponsiveSection
          background="gray"
          spacing={{ y: { default: 16, md: 20, lg: 24 } }}
        >
          <ResponsiveContainer size="xl">
            <ScrollReveal className="text-center mb-12 sm:mb-16 lg:mb-20">
              <ResponsiveText
                size={{
                  default: "3xl",
                  sm: "4xl",
                  md: "5xl",
                  lg: "6xl",
                }}
                weight="bold"
                className="mb-4 sm:mb-6 tracking-tight"
                as="h2"
              >
                Everything You Need to{" "}
                <span className="gradient-text">Fight Food Waste</span>
              </ResponsiveText>
              <ResponsiveText
                size={{
                  default: "lg",
                  sm: "xl",
                  md: "2xl",
                }}
                className="text-gray-600 max-w-3xl mx-auto leading-relaxed px-4"
                as="p"
              >
                Our comprehensive platform combines AI technology with practical
                tools to help you make the most of your food.
              </ResponsiveText>
            </ScrollReveal>

            <StaggerContainer>
              <ResponsiveGrid
                cols={{ default: 1, md: 2, lg: 3 }}
                gap={{ default: 6, md: 8 }}
              >
                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            AI Expiration Prediction
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Smart algorithms predict when your food will expire
                            based on storage conditions and historical data.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>

                {/* Additional feature cards with similar pattern */}
                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            Smart Recipe Suggestions
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Get personalized recipes that prioritize ingredients
                            expiring soon, reducing waste while creating
                            delicious meals.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            Local Donation Network
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Connect with nearby food banks and shelters to
                            donate surplus food and help your community.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            Impact Analytics
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Track your waste reduction, money saved, and
                            environmental impact with detailed analytics and
                            insights.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            Cost Tracking
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Monitor how much money you save by reducing food
                            waste and making smarter purchasing decisions.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem>
                  <HoverCard className="h-full">
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden border-0 shadow-medium hover:shadow-hard transition-all duration-500"
                    >
                      <CardHeader className="relative p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <ResponsiveText
                            size={{ default: "lg", sm: "xl" }}
                            weight="semibold"
                            className="mb-3"
                            as="h3"
                          >
                            Business Solutions
                          </ResponsiveText>
                          <ResponsiveText
                            size={{ default: "sm", sm: "base" }}
                            className="text-gray-600 leading-relaxed"
                            as="p"
                          >
                            Specialized tools for restaurants and businesses to
                            manage inventory and reduce commercial food waste.
                          </ResponsiveText>
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverCard>
                </StaggerItem>
              </ResponsiveGrid>
            </StaggerContainer>
          </ResponsiveContainer>
        </ResponsiveSection>

        {/* How It Works */}
        <ResponsiveSection spacing={{ y: { default: 16, md: 20 } }}>
          <ResponsiveContainer size="xl">
            <ScrollReveal className="text-center mb-12 sm:mb-16">
              <ResponsiveText
                size={{ default: "3xl", sm: "4xl", md: "5xl" }}
                weight="bold"
                className="mb-4"
                as="h2"
              >
                How ZeroSpoil Works
              </ResponsiveText>
              <ResponsiveText
                size={{ default: "lg", sm: "xl" }}
                className="text-gray-600"
                as="p"
              >
                Simple steps to start reducing food waste today
              </ResponsiveText>
            </ScrollReveal>

            <StaggerContainer>
              <ResponsiveGrid
                cols={{ default: 1, md: 3 }}
                gap={{ default: 8, md: 12 }}
              >
                <StaggerItem>
                  <ScrollReveal className="text-center" delay={0.2}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-glow animate-bounce-gentle">
                      1
                    </div>
                    <ResponsiveText
                      size={{ default: "lg", sm: "xl" }}
                      weight="semibold"
                      className="mb-2 sm:mb-3"
                      as="h3"
                    >
                      Track Your Food
                    </ResponsiveText>
                    <ResponsiveText
                      size={{ default: "sm", sm: "base" }}
                      className="text-gray-600 leading-relaxed"
                      as="p"
                    >
                      Add your food items with photos, purchase dates, and
                      storage locations. Our AI will predict expiration dates.
                    </ResponsiveText>
                  </ScrollReveal>
                </StaggerItem>

                <StaggerItem>
                  <ScrollReveal className="text-center" delay={0.4}>
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-glow animate-bounce-gentle"
                      style={{ animationDelay: "0.5s" }}
                    >
                      2
                    </div>
                    <ResponsiveText
                      size={{ default: "lg", sm: "xl" }}
                      weight="semibold"
                      className="mb-2 sm:mb-3"
                      as="h3"
                    >
                      Get Smart Suggestions
                    </ResponsiveText>
                    <ResponsiveText
                      size={{ default: "sm", sm: "base" }}
                      className="text-gray-600 leading-relaxed"
                      as="p"
                    >
                      Receive personalized recipe recommendations and
                      preservation tips to use ingredients before they expire.
                    </ResponsiveText>
                  </ScrollReveal>
                </StaggerItem>

                <StaggerItem>
                  <ScrollReveal className="text-center" delay={0.6}>
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-glow animate-bounce-gentle"
                      style={{ animationDelay: "1s" }}
                    >
                      3
                    </div>
                    <ResponsiveText
                      size={{ default: "lg", sm: "xl" }}
                      weight="semibold"
                      className="mb-2 sm:mb-3"
                      as="h3"
                    >
                      Make an Impact
                    </ResponsiveText>
                    <ResponsiveText
                      size={{ default: "sm", sm: "base" }}
                      className="text-gray-600 leading-relaxed"
                      as="p"
                    >
                      Donate surplus food to local organizations and track your
                      environmental and financial impact over time.
                    </ResponsiveText>
                  </ScrollReveal>
                </StaggerItem>
              </ResponsiveGrid>
            </StaggerContainer>
          </ResponsiveContainer>
        </ResponsiveSection>

        {/* CTA Section */}
        <ResponsiveSection
          background="primary"
          spacing={{ y: { default: 16, md: 20 } }}
        >
          <ResponsiveContainer size="lg" className="text-center text-white">
            <ScrollReveal>
              <ResponsiveText
                size={{ default: "3xl", sm: "4xl", md: "5xl" }}
                weight="bold"
                className="mb-4 sm:mb-6"
                as="h2"
              >
                Ready to Make a Difference?
              </ResponsiveText>
              <ResponsiveText
                size={{ default: "lg", sm: "xl" }}
                className="mb-6 sm:mb-8 opacity-90"
                as="p"
              >
                Join thousands of users who are already reducing food waste and
                saving money with ZeroSpoil.
              </ResponsiveText>
              <Link href="/signup">
                <Button
                  size="xl"
                  variant="secondary"
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-hard hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </ScrollReveal>
          </ResponsiveContainer>
        </ResponsiveSection>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <ResponsiveContainer size="xl" padding={{ default: 4, sm: 6, lg: 8 }}>
            <ResponsiveSpacing y={{ default: 12, md: 16 }}>
              <ScrollReveal>
                <ResponsiveGrid
                  cols={{ default: 1, sm: 2, md: 4 }}
                  gap={{ default: 6, md: 8 }}
                  className="mb-8 sm:mb-12"
                >
                  <div>
                    <FlexResponsive
                      align="center"
                      gap={3}
                      className="mb-4 sm:mb-6"
                    >
                      <Leaf className="h-8 w-8 lg:h-10 lg:w-10 text-primary animate-pulse-gentle" />
                      <ResponsiveText
                        size={{ default: "xl", sm: "2xl" }}
                        weight="bold"
                        as="span"
                      >
                        ZeroSpoil
                      </ResponsiveText>
                    </FlexResponsive>
                    <ResponsiveText
                      size={{ default: "sm", sm: "base" }}
                      className="text-gray-400 leading-relaxed"
                      as="p"
                    >
                      Making food waste reduction accessible and impactful for
                      everyone.
                    </ResponsiveText>
                  </div>

                  <div>
                    <ResponsiveText
                      size={{ default: "base", sm: "lg" }}
                      weight="semibold"
                      className="mb-4"
                      as="h3"
                    >
                      Quick Links
                    </ResponsiveText>
                    <ul className="space-y-2 text-gray-400">
                      <li>
                        <Link
                          href="/login"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Sign Up
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Dashboard
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <ResponsiveText
                      size={{ default: "base", sm: "lg" }}
                      weight="semibold"
                      className="mb-4"
                      as="h3"
                    >
                      Support
                    </ResponsiveText>
                    <ul className="space-y-2 text-gray-400">
                      <li>
                        <Link
                          href="/help"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/privacy"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/terms"
                          className="hover:text-white transition-colors duration-200 text-sm sm:text-base"
                        >
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                </ResponsiveGrid>

                <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400">
                  <ResponsiveText size={{ default: "xs", sm: "sm" }} as="p">
                    &copy; 2024 ZeroSpoil. All rights reserved.
                  </ResponsiveText>
                </div>
              </ScrollReveal>
            </ResponsiveSpacing>
          </ResponsiveContainer>
        </footer>
      </div>
    </HomeClient>
  );
}
