import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    TelegramLoginWidget: any;
  }
}

interface TelegramLoginButtonProps {
  botName?: string;
  requestAccess?: any;
  usePic?: string;
  dataOnauth?: any;
  dataAuthUrl?: string;
  widgetVersion?: string;
}

function TelegramLoginButton({
  botName = 'criptomaniacos_carteira_bot',
  requestAccess,
  usePic,
  dataOnauth,
  dataAuthUrl,
  widgetVersion = '16',
}: TelegramLoginButtonProps) {
  const [telegramBtn, setTelegramBtn] = useState<React.ReactNode>(null);
  useEffect(() => {
    window.TelegramLoginWidget = {
      dataOnauth: (user: any) => dataOnauth(user),
    };
    setTelegramBtn(
      React.createElement('script', {
        src: 'https://telegram.org/js/telegram-widget.js?' + widgetVersion,
        'data-telegram-login': botName,
        'data-request-access': requestAccess,
        'data-userpic': usePic,
        'data-onauth': 'TelegramLoginWidget.dataOnauth(user)',
        'data-auth-url': dataAuthUrl,
        async: true,
      })
    );
  }, [botName, dataAuthUrl, dataOnauth, requestAccess, usePic, widgetVersion]);

  return <>{telegramBtn}</>;
}

export default TelegramLoginButton;
