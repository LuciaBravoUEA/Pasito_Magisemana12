import type { ComponentProps } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { IonInput } from '@ionic/react';

export interface AppInputProps extends Omit<ComponentProps<typeof IonInput>, 'label' | 'errorText'> {
  label: string;
  error?: string;
}

const AppInput: React.FC<AppInputProps> = ({ label, error, type = 'text', onIonFocus, ...rest }) => {
  const handleFocus: NonNullable<AppInputProps['onIonFocus']> = event => {
    onIonFocus?.(event);

    if (Capacitor.isNativePlatform()) {
      void Keyboard.show();
    }
  };

  return (
    <IonInput
      label={label}
      type={type}
      inputmode={type === 'email' ? 'email' : 'text'}
      labelPlacement="stacked"
      fill="outline"
      className={`app-input${error ? ' ion-invalid ion-touched' : ''}`}
      errorText={error}
      aria-invalid={Boolean(error)}
      aria-label={label}
      onIonFocus={handleFocus}
      {...rest}
    />
  );
};

export default AppInput;
