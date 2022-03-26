import React from "react";

const HuggyChatScript = () => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<script>
        !(function (b, t, c) {
          ((c = t.createElement(b)).async = 1),
            (c.src = 'https://s.cmania.co/membros.js'),
            (b = t.getElementsByTagName(b)[0]).parentNode.insertBefore(c, b);
        })('script', document);
      </script>`,
      }}
    ></div>
  );
};

export default HuggyChatScript;

//<!-- Init code Huggy.chat  //--><!-- End code Huggy.chat  //-->
