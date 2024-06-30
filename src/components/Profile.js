import { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import EditProfile from "./EditProfile";
import { useNavigate } from "react-router-dom";

import "../css/Profile.css";
export default function Profile(user, setAlert) {
  const [profileData, setProfileData] = useState({});
  const [posts, setPosts] = useState({});
  const [following, setFollowing] = useState(false);
  const [owner, setOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const params = useParams();
  const navigate = useNavigate("/");
  useEffect(() => {
    updateProfile(params.username);
  }, [params.username, user]);

  function updateFollowing(profile) {
    for (let follower of profile.followers) {
      if (follower.user_name === user.user) {
        setFollowing(true);
        return;
      }
    }
    setFollowing(false);
  }
  function updateProfile(username) {
    fetch("https://ultra-garrulous-face.glitch.me/getProfile?user=" + username)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setAlert({
            variant: "danger",
            message: "User does not exist.",
          });
          return;
        }
        fetch(
          "https://ultra-garrulous-face.glitch.me/getPosts?username=" + username
        )
          .then((res) => res.json())
          .then((posts) => {
            console.log(posts);
            setProfileData(data[0]);
            setPosts(posts);
            updateFollowing(data[0]);
            // console.log(user);
            console.log(data);
            setOwner(user.user === data[0].user_name);
          });
      })
      .catch((err) => console.error(err));
  }
  function followClick() {
    if (owner) return;
    console.log(user.user);
    console.log(params.username);
    if (!following) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: user.user, id: profileData._id }),
      };
      fetch("https://ultra-garrulous-face.glitch.me/addFollower", requestOptions)
        .then((res) => res.json())
        .then((data) => updateProfile(params.username));
    } else {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: user.user, id: profileData._id }),
      };
      fetch(
        "https://ultra-garrulous-face.glitch.me/removeFollower",
        requestOptions
      )
        .then((res) => res.json())
        .then((data) => updateProfile(params.username));
    }
  }
  function hideEditCallback() {
    updateProfile(params.username);
    setEditing(false);
  }
  if (profileData == {}) return null;
  return (
    <div className="profile">
      <EditProfile
        user={user}
        show={editing}
        hideCallBack={hideEditCallback}
        profileData={profileData}
        setAlert={setAlert}
      />
      <div className="profile-banner">
        <h4>@{profileData.user_name}</h4>
        <div className="follow-button">
          {user.user !== "" && user && !owner ? (
            <Button
              variant={following ? "danger" : "success"}
              onClick={followClick}
            >
              {following ? "Unfollow" : "Follow"}
            </Button>
          ) : null}
          {user && owner ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : null}
          {user.user == "" ? (
            <Button variant="primary" onClick={() => navigate("/login")}>
              Follow
            </Button>
          ) : null}
        </div>
        <div className="profile-data">
          <img
            src={
              profileData.photo
                ? profileData.photo.asset.url
                : "https://via.placeholder.com/80"
            }
            id="profile-img"
          />
          <div className="vertical-data">
            <p>
              <strong>Posts</strong>
            </p>
            <h4>{posts ? posts.length : 0}</h4>
          </div>
          <div className="vertical-data">
            <p>
              <strong>Followers</strong>
            </p>
            <h4>{profileData.followers ? profileData.followers.length : 0}</h4>
          </div>
          <div className="vertical-data">
            <p>
              <strong>Following</strong>
            </p>
            <h4>{profileData.following ? profileData.following : 0}</h4>
          </div>
        </div>
        <div className="profile-bio">
          <div className="profile-name">
            <strong>
              {(profileData.first_name ? profileData.first_name : "") +
                " " +
                (profileData.last_name ? profileData.last_name : "")}
            </strong>
          </div>
          <div className="profile-text">{profileData.bio}</div>
        </div>
        <div className="break1"></div>
        <br />
        <br />
        <div className="profile-posts-wrapper">
          <div className="profile-posts">
            {posts && posts.length > 0
              ? posts.map((post, idx) => {
                  return <img src={post.photo.asset.url} key={idx} alt="" />;
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
