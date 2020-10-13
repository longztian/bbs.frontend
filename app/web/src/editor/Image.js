import React, { useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { FormHelperText } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  figure: {
    margin: "0.5rem",
    display: "flex",
    flexFlow: "column nowrap",
    width: "200px",
  },
}));

function Image({ name, src, code, index, updateImageName, deleteImage }) {
  const imgRef = useRef(null);
  const classes = useStyles();

  useEffect(() => {
    if (!code) {
      imgRef.current.onload = () => {
        URL.revokeObjectURL(src);
      };
    }
  }, []);

  return (
    <figure className={classes.figure}>
      <img ref={imgRef} src={src} width="200" />
      <figcaption>
        <TextField
          required
          fullWidth
          label="名称"
          size="small"
          value={name}
          onChange={(event) => updateImageName(index, event.target.value)}
        />
        {code && (
          <TextField
            fullWidth
            disabled
            label="代码"
            size="small"
            value={code}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => deleteImage(index)}
        >
          删除
        </Button>
      </figcaption>
    </figure>
  );
}

export default Image;