import React from 'react';
import { Game } from '../types';
import { motion } from 'motion/react';
import { ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  const isNew = game.createdAt?.toDate && 
    (new Date().getTime() - game.createdAt.toDate().getTime()) < 4 * 24 * 60 * 60 * 1000;


  const ratings = game.ratings || {};
  const ratingValues = Object.values(ratings);
  const averageRating = ratingValues.length > 0 
    ? ((ratingValues as number[]).reduce((a, b) => Number(a) + Number(b), 0) / ratingValues.length).toFixed(1)
    : "0.0";
  const ratingCount = ratingValues.length;

  return (
    <Link to={`/post/${game.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer bg-[#1A0B2E] border border-white/10 rounded-2xl p-4 hover:bg-[#2D164B] transition-all duration-300 h-full flex flex-col relative"
      >
        {isNew && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-md animate-pulse">
            Yeni
          </div>
        )}
        <div className="aspect-video bg-[#1a1a2e] rounded-xl mb-4 overflow-hidden relative shrink-0">
          {game.imageUrl ? (
            <img 
              src={game.imageUrl} 
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-800"></div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <h4 className="font-bold mb-1 text-white line-clamp-1">{game.title}</h4>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">{game.category}</p>
            {ratingCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500 dark:text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-500 dark:fill-yellow-400" />
                {averageRating}
              </div>
            )}
          </div>
          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(Array.isArray(game.tags) ? game.tags : [game.tags]).map((tag, idx) => (
                <span key={idx} className="bg-[#4c1d95] text-[#e9d5ff] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-white/60 line-clamp-2 mb-4 flex-1">
            {game.description}
          </p>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
            <span className="text-xs font-medium text-white/40">
              {game.eventDate ? new Date(game.eventDate).toLocaleDateString('tr-TR') : ''}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold text-[#a855f7] group-hover:text-[#e9d5ff] transition-colors">
              Detayları Gör
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
