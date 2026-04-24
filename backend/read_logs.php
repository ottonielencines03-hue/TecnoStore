<?php
$lines = file('storage/logs/laravel.log');
$last_lines = array_slice($lines, -50);
echo implode("", $last_lines);
