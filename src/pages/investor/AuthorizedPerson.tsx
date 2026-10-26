import { ABOUT_CARD } from '../../components/about/AboutHero';

/** The Authorized Person page's body, under the investor page's hero. The
 *  details are published as an image. */
export default function AuthorizedPerson() {
  return (
    <section className="px-4 py-14 sm:px-6 md:px-10">
      <div className={`mx-auto max-w-5xl p-4 sm:p-8 ${ABOUT_CARD}`}>
        <img src="/images/investor/authorized-person.jpg" alt="Authorized Person" className="h-auto w-full rounded-xl" />
      </div>
    </section>
  );
}
