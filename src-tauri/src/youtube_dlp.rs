//! YT-DLP handler.
use std::{fs::{canonicalize, create_dir_all}, path::PathBuf, process::Stdio};

//* Create error related things.
use thiserror::Error;
#[derive(Error, Debug)]
pub enum YoutubeDLError {
   #[error("Failed to execute youtube-dl")]
   IOError(#[from] std::io::Error),
   #[error("Failed to conver path")]
   UTF8Error(#[from] std::string::FromUtf8Error),
   #[error("Youtube-dl existed with {0}")]
   Failure(String),  
}


//* Main handler
// I am not dealing with youtube-dl or youtube-dlc. We are using youtube-dlp
#[derive(Clone, Debug)]
pub struct Argument {
    argument: String,
    input: Option<String>,
}

impl Argument {
    pub fn new(argument: &str) -> Argument {
        Argument {
            argument: argument.to_string(),
            input: None,
        }
    }

    pub fn new_with_arg(argument: &str, input: &str) -> Argument {
        Argument {
            argument: argument.to_string(),
            input: Option::from(input.to_string())
        }
    }
}

impl std::fmt::Display for Argument {
    fn fmt(&self, fmt: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self.input {
            Some(input) => write!(fmt,  "{} {}", self.argument, input),
            None => write!(fmt, "{}", self.argument)

        }

    }
}


// Struct to create a download location and basically represent a yt-dl task.
#[derive(Clone, Debug)]
pub struct YoutubeDL {
    path: std::path::PathBuf,
    links: Vec<String>,
    args: Vec<Argument>
}

// Result of YoutubeDL
#[derive(Clone, Debug)]
pub struct YoutubeDLResult {
    path: PathBuf,
    output: String
}

impl YoutubeDLResult {
    fn new(path: &PathBuf) -> YoutubeDLResult {
        YoutubeDLResult {
            path: path.clone(),
            output: String::new()
        }
    }

    pub fn output(&self) -> &str {
        &self.output
    }

    pub fn output_dir(&self) -> &PathBuf {
        &self.path
    }
}

impl YoutubeDL {
    pub fn new_multiple_links(
        dl_path: &PathBuf,
        arguments: Vec<Argument>,
        links: Vec<String>
    ) -> Result<YoutubeDL, YoutubeDLError> {
        let path = std::path::Path::new(dl_path);

        if !path.exists() {
            create_dir_all(&path)?;
        }


        if !path.is_dir() {
            return Err(YoutubeDLError::IOError(std::io::Error::new(std::io::ErrorKind::Other, "Path is not a directory~")));
        }

        let path = canonicalize(path)?;
        Ok(YoutubeDL {path, links, args: arguments})
    }

    pub fn new(dl_path: &PathBuf, args: Vec<Argument>, link: &str) ->  Result<YoutubeDL, YoutubeDLError> {
        YoutubeDL::new_multiple_links(dl_path, args, vec![link.to_string()])
    }

    pub fn spawn_youtube_dl(&self) -> Result<std::process::Output, YoutubeDLError> {
        let mut cmd = std::process::Command::new("yt-dlp");
        cmd.current_dir(&self.path)
            .env("LC_ALL", "en_US.UTF-8")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        for arg in self.args.iter() {
            match &arg.input {
                Some(input) => cmd.arg(&arg.argument).arg(input),
                None => cmd.arg(&arg.argument)
            };
        }

        for link in self.links.iter() {
            cmd.arg(&link);
        }

        let pr = cmd.spawn()?;
        Ok(pr.wait_with_output()?)
    }

    pub fn download(&self) -> Result<YoutubeDLResult, YoutubeDLError> {
        let output = self.spawn_youtube_dl()?;
        let mut result = YoutubeDLResult::new(&self.path);

        if !output.status.success() {
            return Err(YoutubeDLError::Failure(String::from_utf8(output.stderr)?));
        }
        
        result.output = String::from_utf8(output.stdout)?;

        Ok(result)
    }
}
