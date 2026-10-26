import { ABOUT_CARD } from '../../components/about/AboutHero';

/** The Grievance Redressal page's body, under the investor page's hero. The
 *  details are published as an image. */
export default function GrievanceRedressal() {
  return (
    <section className="px-4 py-14 sm:px-6 md:px-10">
      <div className={`mx-auto max-w-5xl p-4 sm:p-8 ${ABOUT_CARD}`}>
        <img src="/images/investor/grievance-redressal.jpg" alt="Grievance Redressal" className="h-auto w-full rounded-xl" />
      </div>
    </section>
  );
}
