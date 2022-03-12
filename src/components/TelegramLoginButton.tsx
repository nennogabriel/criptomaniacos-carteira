import React from "react";

declare global {
  interface Window {
    TelegramLoginWidget: any;
  }
}

interface TelegramLoginButtonProps {
  widgetVersion: string;
  botName: string;
  dataOnauth: any;
}

class TelegramLoginButton extends React.Component<TelegramLoginButtonProps> {
  instance: any;

  constructor(props: TelegramLoginButtonProps) {
    super(props);
  }

  componentDidMount() {
    const {
      botName,
      requestAccess,
      usePic,
      dataOnauth,
      dataAuthUrl,
      widgetVersion,
    }: any = this.props;

    window.TelegramLoginWidget = {
      dataOnauth: (user) => dataOnauth(user),
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?" + widgetVersion;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-request-access", requestAccess);
    script.setAttribute("data-userpic", usePic);
    if (dataAuthUrl !== undefined) {
      script.setAttribute("data-auth-url", dataAuthUrl);
    } else {
      script.setAttribute(
        "data-onauth",
        "TelegramLoginWidget.dataOnauth(user)"
      );
    }
    script.async = true;
    this.instance.appendChild(script);
  }

  render() {
    return (
      <div
        ref={(component) => {
          this.instance = component;
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default TelegramLoginButton;
