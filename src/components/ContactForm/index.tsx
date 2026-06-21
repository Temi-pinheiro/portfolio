export default function ContactForm() {
  return (
    <div
      className=" pt-20 md:pt-[100px] max-w-[1220px] mx-auto w-full section-padding md:mb-[182px] flex flex-col gap-y-8 md:gap-y-0 md:flex-row md:justify-between max-sm:pb-9"
      id="contact"
    >
      <div>
        <h2 className="font-semibold text-[20px] md:text-[44px]">Say Hello</h2>
        <p className=" font-light text-[#ccc] text-sm md:max-w-[400px]">
          Not open to work currently but i&apos;m always down for a chat.
          <br />
          Currently living in Bali.
          <br />
          You can get in touch with me on{' '}
          <a href="https://x.com/ndmhjt" target="_blank">
            @ndmhjt
          </a>{' '}
          or shoot me an email at{' '}
          <a href="mailto:temitopepinheiro@gmail.com" target="_blank">
            temitopepinheiro@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
