import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <>
      <Header />
      <div className="bg-[#1a365d] text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl font-bold mb-4">不動産相場検索</h1>
          <SearchForm compact />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">データを読み込み中...</p>
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>

      {/* CTA */}
      <section className="bg-[#fdf2e9] py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-3 text-[#1a365d]">
            もっと正確な査定をお求めですか？
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            公的データに加え、最新の市況・物件固有の条件を踏まえた査定を無料でご提供。
          </p>
          <a
            href="#contact"
            className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg"
          >
            無料査定を依頼する
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
