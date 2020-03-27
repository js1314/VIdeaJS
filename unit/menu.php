<?php

function create_menu($dir, $_ = false) {
	$files = scandir($dir);
	$url = str_replace(array($_SERVER["DOCUMENT_ROOT"], "\\"), array("", "/"), str_replace("\\", "/", $dir));
	foreach ($files as $file) {
		if ($file !== "." && $file !== "..") {
			$path = $dir . DIRECTORY_SEPARATOR . $file;
			if (is_dir($path)) {
				echo "<h2>" . ($_ ? " - " : "") . $file . "</h" . ($_ ? 3 : 2) . ">";
				create_menu($path, true);
			} else if ($_ && $file !== "response.json") {
				echo '<p><a href="' . $url . '/' . $file . '">' . strtok($file, ".") . '</a></p>';
			}
		}
	}
}

create_menu(dirname(__FILE__));
