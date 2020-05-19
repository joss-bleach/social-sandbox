import React, { Fragment } from "react";
import spinner from "./802.gif";

export default () => (
  <Fragment>
    <img
      src={spinner}
      style={{ width: "50px", margin: "auto", display: "block" }}
      alt="Loading..."
    />
  </Fragment>
);
