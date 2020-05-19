import React from "react";
import Moment from "react-moment";
import PropTypes from "prop-types";

const ProfileEducation = ({
  education: { school, degree, field_of_study, current, to, from, description },
}) => (
  <div>
    <h3 className="text-dark">{school}</h3>
    <p>
      <Moment format="DD/MM/YYYY">{from}</Moment> -{" "}
      {!to ? " Present" : <Moment format="DD/MM/YYYY">{to}</Moment>}
    </p>
    <p>
      <strong>Degree: </strong>
      {degree}
    </p>
    <p>
      <strong>Field of Study: </strong>
      {field_of_study}
    </p>
    <p>
      <strong>Description: </strong>
      {description}
    </p>
  </div>
);

ProfileEducation.propTypes = {
  education: PropTypes.array.isRequired,
};

export default ProfileEducation;
