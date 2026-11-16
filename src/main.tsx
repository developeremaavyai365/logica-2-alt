import './index.css';
import { loadCatalogue } from './catalogue-source';

/* The product catalogue comes from the backend (managed in the admin panel).
   It is settled first — a saved copy at once, or a short wait on a first
   visit, or the built-in list — and only then is the site's code imported,
   so every page and lookup is built from the same catalogue. Nothing that
   reads product data may be imported here directly. */
void loadCatalogue().then(() => import('./bootstrap'));
