import React from "react";

const HuggyChatScript = () => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<script>(function (c,r,i,p,t,o) {p = c.createElement(r);p.async = 1;p.src = i;t = c.getElementsByTagName(r)[0];t.parentNode.insertBefore(p, t);})(document,"script","https://tools.criptomaniacos.dev/chat/widget.js",);</script>`,
      }}
    ></div>
  );
};

export default HuggyChatScript;

//<!-- Init code Huggy.chat  //--><!-- End code Huggy.chat  //-->
