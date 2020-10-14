import React, { useRef, useState } from "react";

import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
// import ReactMarkdown from "react-markdown";
import { rest, validateResponse } from "../lib/common";
import TextField from "@material-ui/core/TextField";
import Image from "./Image";

import ImageBlobReduce from "image-blob-reduce";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "900px",
    margin: "auto",
  },
  titleDiv: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row-reverse",
    },
  },
  halfWidth: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
  },
  imgDiv: {
    display: "flex",
    alignItems: "flex-end",
  },
}));

function Editor() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState("");
  const [submit, setSubmit] = useState("");

  const fileInputRef = useRef(null);
  const classes = useStyles();

  window.app.openNodeEditor = ({
    nodeId = null,
    tagId = null,
    title = "",
    body = "",
    images = [],
  } = {}) => {
    if (nodeId) {
      setUrl(`/node/${nodeId}/edit`);
      setSubmit("更新话题");
    } else {
      setUrl(`/forum/node`);
      setSubmit("发布新话题");
    }
    setData({
      tagId,
      title,
      body,
      images,
    });
  };

  window.app.openCommentEditor = ({
    nodeId = null,
    commentId = null,
    body = "",
    images = [],
  } = {}) => {
    if (commentId) {
      setUrl(`/comment/${commentId}/edit`);
      setSubmit("更新评论");
    } else if (nodeId) {
      setUrl(`/node/${nodeId}/comment`);
      setSubmit("发布新评论");
    } else {
      return;
    }
    setData({
      body,
      images,
    });
  };

  if (!data) {
    return "";
  }

  const handleTagChange = (event) => {
    setData({
      ...data,
      tagId: event.target.value,
    });
  };

  const handleTitleChange = (event) => {
    setData({
      ...data,
      title: event.target.value,
    });
  };

  const handleBodyChange = (event) => {
    setData({
      ...data,
      body: event.target.value,
    });
  };

  const fileInputChange = (event) => {
    var fileInput = event.target;
    var file = fileInput.files[0];
    if (!file) {
      return;
    }

    const reducer = new ImageBlobReduce();
    reducer
      .toBlob(file, {
        max: 600,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      })
      .then(function (blob) {
        fileInput.value = null;
        const tmp = [
          ...data.images,
          {
            name: file.name,
            src: URL.createObjectURL(blob),
            blob,
          },
        ];
        setData({
          ...data,
          images: tmp,
        });
      });
  };

  function updateImageName(index, name) {
    const tmp = [...data.images];
    tmp[index].name = name;
    setData({
      ...data,
      images: tmp,
    });
  }

  function deleteImage(index) {
    const tmp = [...data.images];
    tmp.splice(index, 1);
    setData({
      ...data,
      images: tmp,
    });
  }

  const postMessage = (event) => {
    var formData = new FormData();
    if ("title" in data) {
      formData.append("title", data.title);
      formData.append("tagId", data.tagId);
      formData.append("body", data.body);
      data.images.map((image) => {
        if ("blob" in image) {
          const id = Math.random().toString(36).substring(2, 5);
          formData.append(id, blob, id);
          formData.append("file_id[]", id);
        } else {
          formData.append("file_id[]", image.id);
        }
        formData.append("file_name[]", image.name);
      });
    }
    // formData.getAll("file_id[]").forEach((id) => {
    //   if (blobs.has(id)) {
    //     formData.append(id, blobs.get(id), id);
    //   }
    // });

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        validateResponse(data);

        if (data.redirect) {
          // blobs.clear();

          var a = document.createElement("a");
          a.href = data.redirect;

          if (
            window.location.href.replace(/#.*/, "") ===
            a.href.replace(/#.*/, "")
          ) {
            window.location.reload();
          } else {
            window.location.assign(a.href);
          }
        }
      })
      .catch((error) => {
        alert(error);
      });
    // if (message.length < 5) {
    //   alert("短信内容最少为5个字符");
    //   return;
    // }
    // rest
    //   .post("/api/message", {
    //     toUid: toUser.id,
    //     body: message,
    //     topicMid,
    //   })
    //   .then((data) => {
    //     if (validateResponse(data)) {
    //       // redirect
    //     }
    //   });
  };

  return (
    <div className={classes.root}>
      {"title" in data && (
        <div className={classes.titleDiv}>
          <TextField
            className={classes.halfWidth}
            required
            select
            value={data.tagId}
            onChange={handleTagChange}
            label="讨论区"
            placeholder="话题的讨论区"
          >
            {window.app.navTags.map((tagId) => (
              <MenuItem key={tagId.id} value={tagId.id}>
                {tagId.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            className={classes.halfWidth}
            required
            value={data.title}
            onChange={handleTitleChange}
            label="标题"
            placeholder="话题的标题"
          />
        </div>
      )}
      <TextField
        required
        fullWidth
        multiline
        value={data.body}
        onChange={handleBodyChange}
        label="正文"
        placeholder="支持纯文本格式和BBCode格式"
      />
      {/* <ReactMarkdown className="preview" source={body} /> */}
      <div>
        <div className={classes.imgDiv}>
          {data.images &&
            data.images.map((image, index) => (
              <Image
                key={index}
                {...image}
                {...{ index, updateImageName, deleteImage }}
              />
            ))}
        </div>
        <input
          ref={fileInputRef}
          style={{ display: "none" }}
          id="file_input"
          type="file"
          onChange={fileInputChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => fileInputRef.current.click()}
        >
          上传图片
        </Button>
      </div>
      <div>
        <Button variant="contained" color="primary" onClick={postMessage}>
          {submit}
        </Button>
      </div>
    </div>
  );
}

export default Editor;
