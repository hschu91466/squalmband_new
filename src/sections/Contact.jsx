import ContactForm from "../components/features/ContactForm";

const Contact = () => {
  return (
    <section id="contact" className="section-flex">
      <h2 className="section-heading">Contact</h2>
      <div className="section-content-center">
        <div className="contact-panel card">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
