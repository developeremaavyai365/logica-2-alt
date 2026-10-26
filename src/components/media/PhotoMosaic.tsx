import { Maximize2 } from 'lucide-react';

/** Grid areas for an entry's photos, by how many there are: the first photo
 *  leads large and the rest arrange around it. Each value is the classes for
 *  the grid, then for each photo in order. */
function layoutFor(count: number): { grid: string; cells: string[] } {
  switch (count) {
    case 1:
      return { grid: 'grid-cols-1', cells: ['aspect-[16/9]'] };
    case 2:
      return { grid: 'grid-cols-2', cells: ['aspect-[4/3]', 'aspect-[4/3]'] };
    case 3:
      return {
        grid: 'grid-cols-2 sm:grid-cols-3 sm:grid-rows-2',
        cells: ['col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto', 'aspect-[4/3]', 'aspect-[4/3]'],
      };
    case 4:
      // One large, three stacked beside it.
      return {
        grid: 'grid-cols-3 sm:grid-rows-3',
        cells: [
          'col-span-3 aspect-[16/9] sm:col-span-2 sm:row-span-3 sm:aspect-auto',
          'aspect-square sm:aspect-[16/10]',
          'aspect-square sm:aspect-[16/10]',
          'aspect-square sm:aspect-[16/10]',
        ],
      };
    case 5:
      // One large, four in a square beside it.
      return {
        grid: 'grid-cols-2 sm:grid-cols-4 sm:grid-rows-2',
        cells: ['col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto', 'aspect-[4/3]', 'aspect-[4/3]', 'aspect-[4/3]', 'aspect-[4/3]'],
      };
    default: {
      // Six or more: one large with two stacked beside it, then rows of
      // three. On a phone, two to a row, and an odd one out spans the row.
      const rest = count - 1;
      return {
        grid: 'grid-cols-2 sm:grid-cols-3',
        cells: [
          'col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto',
          ...Array.from({ length: rest }, (_, i) =>
            rest % 2 === 1 && i === rest - 1 ? 'col-span-2 aspect-[16/10] sm:col-span-1 sm:aspect-[4/3]' : 'aspect-[4/3]',
          ),
        ],
      };
    }
  }
}

/** An entry's photos as a premium grid, every one of them shown. Each photo
 *  is its own button that opens the full-screen viewer at that photo. */
export default function PhotoMosaic({ photos, title, onOpen }: { photos: string[]; title: string; onOpen: (index: number) => void }) {
  const { grid, cells } = layoutFor(photos.length);

  return (
    <div className={`grid gap-2.5 sm:gap-3 ${grid}`}>
      {photos.map((src, i) => (
        <button
          key={`${src}-${i}`}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`View photo ${i + 1} of ${photos.length}: ${title}`}
          className={`group/photo relative overflow-hidden rounded-2xl bg-[#E2E9FC] shadow-[0_22px_44px_-28px_rgba(6,26,64,0.55)] ring-1 ring-[#061A40]/[0.05] ${cells[i] ?? 'aspect-[4/3]'}`}
        >
          {/* A photo on its own is shown whole — posters and certificates
              are often portrait — over a blurred copy that fills the frame. */}
          {photos.length === 1 && (
            <img src={src} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
          )}
          <img
            src={src}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full ${photos.length === 1 ? 'object-contain' : 'object-cover'} transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/photo:scale-[1.07]`}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[#030B1F]/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/photo:opacity-100" />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#061A40] opacity-0 shadow-lg transition-all duration-500 group-hover/photo:translate-y-0 group-hover/photo:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </span>
        </button>
      ))}
    </div>
  );
}
