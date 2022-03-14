import React from "react";

const HuggyChatScript = () => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
  <script>var $_Huggy = { defaultCountry: '+55', uuid: 'b7bc2fce-928a-407b-b55e-228a1a3df0dd' , company: '335060', channelGreeting: 'Olá! Gostaria de conversar com o time de atendimento.'}; (function(i,s,o,g,r,a,m){ i[r]={context:{id:'6f572ea0161fbcb0a44168df7c23ea65'}};a=o;o=s.createElement(o); o.async=1;o.src=g;m=s.getElementsByTagName(a)[0];m.parentNode.insertBefore(o,m); })(window,document,'script','https://js.huggy.chat/widget.min.js','pwz');</script>
  `,
      }}
    ></div>
  );
};

export default HuggyChatScript;

//<!-- Init code Huggy.chat  //--><!-- End code Huggy.chat  //-->
