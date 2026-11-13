'use client';

import { useRef } from 'react';

// The intake's inputs. Choices are real radios and checkboxes under the chip
// styling, so arrow keys, Space and screen readers work as they do anywhere.

export const fieldLabel = 'font-mono text-[12px] tracking-[0.1em] text-muted uppercase';
export const textInput =
  'mt-2.5 w-full rounded-[14px] border border-line bg-paper px-4 py-3.5 text-[18px] text-ink transition-colors duration-300 placeholder:text-muted/60 hover:border-muted focus:border-ink';

const chip =
  'inline-flex min-h-11 items-center rounded-full border border-line px-[18px] py-2 text-[16px] leading-[1.3] transition-[background-color,border-color,color,scale] duration-300 ease-soft select-none hover:border-ink peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink peer-focus-visible:outline active:scale-[0.97]';

type ChipsProps = {
  name: string;
  legend: string;
  options: readonly string[];
} & (
  | {
      multiple?: false;
      value: string;
      onChange: (value: string) => void;
      // Called when a chip is picked by pointer, so the step can move on by
      // itself. Not on arrow keys, which move between chips.
      onPick?: (value: string) => void;
      required?: boolean;
    }
  | {
      multiple: true;
      value: string[];
      onChange: (value: string[]) => void;
      onPick?: never;
      required?: never;
    }
);

export const Chips = (props: ChipsProps) => {
  const { name, legend, options } = props;
  const byPointer = useRef(false);
  return (
    <fieldset>
      <legend className='sr-only'>{legend}</legend>
      <div className='flex flex-wrap gap-2.5'>
        {options.map((option, i) => {
          const checked = props.multiple
            ? props.value.includes(option)
            : props.value === option;
          return (
            <label
              key={option}
              className='relative cursor-pointer'
              onPointerDown={() => {
                byPointer.current = true;
              }}
              // The click lands in the same task as the pointer-up, so this
              // clears the flag after it, including when the chip was
              // already picked and no change fires.
              onPointerUp={() => {
                setTimeout(() => {
                  byPointer.current = false;
                });
              }}
            >
              <input
                type={props.multiple ? 'checkbox' : 'radio'}
                name={name}
                value={option}
                checked={checked}
                required={!props.multiple && props.required && i === 0}
                onChange={() => {
                  const pointer = byPointer.current;
                  byPointer.current = false;
                  if (props.multiple) {
                    props.onChange(
                      checked
                        ? props.value.filter((item) => item !== option)
                        : [...props.value, option]
                    );
                  } else {
                    props.onChange(option);
                    if (pointer) props.onPick?.(option);
                  }
                }}
                className='peer absolute inset-0 size-full cursor-pointer opacity-0'
              />
              <span className={chip}>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
