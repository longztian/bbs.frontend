import React, { useState } from "react";

import { validateResponse } from "../lib/common";

const randomId = () => Math.random().toString().slice(2);
const initId = randomId();

function AuthCodeForm(props) {
  const [id, setId] = useState(initId);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [next, setNext] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch(props.handler, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        captcha,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (validateResponse(data)) {
          alert(
            "安全验证码已经发送到您的邮箱，请及时查收。\n" +
              "邮件可能会有几分钟延迟，或者在垃圾箱。"
          );
          setNext(true);
        }
      });
  };

  return next ? (
    props.next
  ) : (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <label>注册邮箱</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label>用户名</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </fieldset>
      {email && username && (
        <fieldset>
          <label>下边图片的内容是什么？</label>
          <input
            type="text"
            required
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
          />
          <div className="captcha">
            <img
              alt="图形验证未能正确显示，请刷新"
              src={"/api/captcha/" + id}
            />
            <br />
            <a style={{ cursor: "pointer" }} onClick={() => setId(randomId())}>
              看不清，换一张
            </a>
          </div>
        </fieldset>
      )}
      {props.children}
      <fieldset>
        <button type="submit">{props.submit}</button>
      </fieldset>
    </form>
  );
}

export default AuthCodeForm;
