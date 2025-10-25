import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 p-4 fixed inset-0 z-50 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 md:w-32 md:h-32 text-gray-300 dark:text-gray-700 opacity-20 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might
            have been moved or deleted.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-2 text-4xl opacity-60">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>
            📄
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
            🔍
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
            ❓
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button asChild size="lg" className="min-w-[200px] gap-2">
            <Link href="/dashboard">
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[200px] gap-2"
          >
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/papers"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Papers
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link
              href="/students"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Students
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link
              href="/advisers"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Advisers
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link
              href="/proposals"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Proposals
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-8">
          Error Code: 404 | DocuHub Admin
        </p>
      </div>
    </div>
  );
}
