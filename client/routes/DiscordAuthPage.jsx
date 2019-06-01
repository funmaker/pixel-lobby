import React from "react";
import qs from "query-string";

export default class DiscordAuthPage extends React.Component {
  
  componentDidMount() {
    const query = qs.parse(location.search);
    window.opener.authCallback(query.code, query.state);
    window.close();
    this.props.history.replace("/");
  }
  
  render() {
    return (
      <div className="DiscordAuthPage" />
    )
  }
}