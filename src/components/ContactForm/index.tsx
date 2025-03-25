'use client';

import { FormHTMLAttributes, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ContactForm() {
  const [message, setMessage] = useState('Send Message');
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const isMutating = isFetching || isPending;
  const sendMail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFetching(true);
    setMessage('Sending');
    const formData = new FormData(e.currentTarget);
    const resetBtn: any = document.getElementById('resetBtn')!;
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mail = await res.json();
      if (mail.statusCode == 200) {
        setMessage('Sent');
        resetBtn.click();
        setTimeout(() => setMessage('Send Message'), 800);
      } else {
        throw new Error();
      }
    } catch (e) {
      setMessage('Please try again');
      setTimeout(() => setMessage('Send Message'), 800);
    }
  };
  return (
    <div
      className=' pt-20 md:pt-[100px] max-w-[1200px] mx-auto w-full section-padding md:mb-[182px] flex flex-col gap-y-8 md:gap-y-0 md:flex-row md:justify-between max-sm:pb-9'
      id='contact'
    >
      <div>
        <h2 id='works' className='font-semibold text-[20px] md:text-[44px]'>
          Say Hello
        </h2>
        <p className=' font-light text-[#808080] text-sm md:max-w-[300px]'>
          Currently open to short term and long term opportunities. Always open
          to conversations about tech as well. You can get in touch with me on{' '}
          <a href='https://x.com/ndmhjt' target='_blank'>
            @ndmhjt
          </a>
          or shoot me an email at{' '}
          <a href='mailto:temitopepinheiro@gmail.com' target='_blank'>
            temitopepinheiro@gmail.com
          </a>
          .
        </p>
      </div>

      {/* <form
        onSubmit={sendMail}
        className='flex flex-col gap-y-12 max-w-[484px] w-full'
      >
        <input
          name='name'
          required
          disabled
          placeholder='Your name'
          className='outline-none border-b border-black py-4 transition duration-200 px-2 dark:border-white caret-[#FA6525] bg-transparent focus:border-[#FA6525]'
        />
        <input
          name='email'
          type='email'
          required
          disabled
          placeholder='Your email'
          className='outline-none border-b border-black py-4 transition duration-200 px-2 dark:border-white caret-[#FA6525] bg-transparent focus:border-[#FA6525]'
        />
        <textarea
          name='message'
          rows={4}
          required
          disabled
          placeholder='Hi Temitope,'
          className='outline-none border-b border-black py-4 transition duration-200 px-2 dark:border-white caret-[#FA6525] bg-transparent focus:border-[#FA6525]'
        />
        <button type='reset' id='resetBtn' className='hidden'>
          reset
        </button>
        <motion.button
          animate={{
            borderColor:
              message.toLowerCase() == 'sent'
                ? '#22c55e'
                : message.toLowerCase() == 'please try again'
                ? '#D00000'
                : '',
          }}
          disabled={message.toLowerCase() != 'send message'}
          type='submit'
          className='border-b py-2 px-3 w-[130px] disabled:cursor-not-allowed flex hover:text-[#FA6525] transition duration-700  border-transparent items-center ml-auto text-sm font-light'
        >
          <motion.span
            className='w-full'
            key={message}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
          >
            {message}
          </motion.span>
        </motion.button>
      </form> */}
    </div>
  );
}
