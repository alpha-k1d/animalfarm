// src/components/StoriesSection.tsx - Real Ghana Agricultural Stories with Real Photos
import React, { useState } from 'react';
import { 
  Quote, 
  MapPin, 
  Award, 
  ChevronRight, 
  X, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { FARMER_STORIES, FarmerStory } from '../data/storiesData';
import { GhanaFlag } from './GhanaFlag';

interface StoriesSectionProps {
  onNavigateToPackages?: () => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({ onNavigateToPackages }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'poultry' | 'aquaculture' | 'crops' | 'livestock'>('all');
  const [activeStoryModal, setActiveStoryModal] = useState<FarmerStory | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const filteredStories = selectedCategory === 'all' 
    ? FARMER_STORIES 
    : FARMER_STORIES.filter(s => s.category === selectedCategory);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Documented Field Impact &bull; Real Ghanaian Outgrowers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-official-serif text-emerald-950">
            Real Stories from Ghanaian Fields
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-1 leading-relaxed">
            Discover how real Ghanaian smallholders, women fishers, and youth mechanization pioneers are expanding yields and earning predictable mobile money rewards with the Animal Farm Ghana co-operative.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Stories' },
            { id: 'poultry', label: 'Poultry' },
            { id: 'aquaculture', label: 'Aquaculture' },
            { id: 'crops', label: 'Grain & Crops' },
            { id: 'livestock', label: 'Livestock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <article 
            key={story.id}
            className="bg-white rounded-3xl border border-zinc-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Primary Real Photo */}
              <div className="relative h-52 w-full overflow-hidden bg-zinc-900">
                <img 
                  src={story.primaryImage} 
                  alt={story.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                    <GhanaFlag size="sm" />
                    <span>{story.region}</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-emerald-950 px-2.5 py-1 rounded-full shadow-xs">
                    {story.badge}
                  </span>
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-emerald-300 font-medium">
                    {story.role}
                  </div>
                  <h3 className="font-bold text-base text-white leading-tight font-official-serif mt-0.5">
                    {story.name}, {story.age}
                  </h3>
                  <div className="text-[10px] text-zinc-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="truncate">{story.district}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <h4 className="font-bold text-sm text-zinc-900 leading-snug font-official-serif group-hover:text-emerald-900 transition-colors">
                  {story.headline}
                </h4>

                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                  {story.excerpt}
                </p>

                {/* Farmer Real Quote */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl relative">
                  <Quote className="w-4 h-4 text-emerald-600 mb-1" />
                  <p className="text-[11px] text-emerald-950 italic leading-relaxed">
                    "{story.quote}"
                  </p>
                </div>

                {/* Verified Performance Stats */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100">
                  {story.stats.map((st, i) => (
                    <div key={i} className="text-center p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
                      <div className="font-black text-xs text-emerald-900 font-mono">{st.value}</div>
                      <div className="text-[9px] text-zinc-500 uppercase font-semibold mt-0.5">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-5 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <div className="text-[10px] text-zinc-500">
                  <span>Total Payout: </span>
                  <strong className="text-emerald-800 font-bold font-mono text-xs">
                    GH₵ {story.totalPayoutGhs.toLocaleString()}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStoryModal(story);
                    setActivePhotoIndex(0);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read Story</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* INTERACTIVE FULL STORY & PHOTO GALLERY MODAL */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-5 sm:p-6 relative shrink-0">
              <button
                onClick={() => setActiveStoryModal(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <GhanaFlag size="sm" />
                  <span>{activeStoryModal.region} &bull; {activeStoryModal.district}</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full">
                  {activeStoryModal.categoryLabel}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-official-serif text-white leading-tight">
                {activeStoryModal.headline}
              </h2>

              <div className="flex items-center gap-4 mt-3 text-xs text-emerald-200">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified MoFA Registry: <strong>{activeStoryModal.verifiedRef}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{activeStoryModal.date}</span>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body - Equipped with custom scrollbar */}
            <div className="p-6 overflow-y-auto custom-scrollbar popup-scroll space-y-6">
              {/* Photo Showcase with Switcher */}
              <div className="space-y-2">
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 shadow-sm">
                  <img
                    src={activePhotoIndex === 0 ? activeStoryModal.primaryImage : activeStoryModal.secondaryImage}
                    alt={activeStoryModal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium">
                    <p className="line-clamp-2">
                      {activePhotoIndex === 0 ? activeStoryModal.primaryImageCaption : activeStoryModal.secondaryImageCaption}
                    </p>
                  </div>
                </div>

                {/* Photo Selector Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActivePhotoIndex(0)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePhotoIndex === 0 
                        ? 'bg-emerald-900 text-white shadow-xs' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Primary Inspection Photo</span>
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex(1)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePhotoIndex === 1 
                        ? 'bg-emerald-900 text-white shadow-xs' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Operational Field Photo</span>
                  </button>
                </div>
              </div>

              {/* Farmer Profile Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-900 text-amber-300 font-black text-lg flex items-center justify-center border-2 border-amber-400 shrink-0">
                    {activeStoryModal.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-base font-official-serif">
                      {activeStoryModal.name}, {activeStoryModal.age}
                    </h3>
                    <p className="text-xs text-zinc-600">
                      {activeStoryModal.role} &bull; {activeStoryModal.coopCluster}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Total Verified Payouts</div>
                  <div className="text-base font-black text-emerald-900 font-mono">
                    GH₵ {activeStoryModal.totalPayoutGhs.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {activeStoryModal.cyclesCompleted} Successful Harvest Cycles
                  </div>
                </div>
              </div>

              {/* Quotation Highlight */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 relative">
                <Quote className="w-5 h-5 text-amber-600 mb-1" />
                <p className="text-xs sm:text-sm text-zinc-800 italic font-medium leading-relaxed">
                  "{activeStoryModal.quote}"
                </p>
                <div className="text-right mt-2 text-xs font-bold text-amber-900">
                  &mdash; {activeStoryModal.name}, {activeStoryModal.district}
                </div>
              </div>

              {/* Full Narrative Text */}
              <div className="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                {activeStoryModal.fullStory.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Verified Performance Metrics */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Key Agricultural & Financial Outcomes</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {activeStoryModal.stats.map((st, i) => (
                    <div key={i} className="text-center p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                      <div className="font-black text-sm text-emerald-900 font-mono">{st.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold mt-0.5">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Backing Notice */}
              <div className="p-3 bg-zinc-100 rounded-xl text-[11px] text-zinc-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  All farm records are audited by the Ministry of Food & Agriculture (MoFA) under the Co-operative Societies Act 1968 (N.L.C.D. 252).
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>

              {onNavigateToPackages && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveStoryModal(null);
                    onNavigateToPackages();
                  }}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Sponsor a Farm Package Like This</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
