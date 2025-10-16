from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn, TimeElapsedColumn
import time

# total duration (2 hours = 7200 seconds)
total_time = 2 * 60 * 60
steps = 1000  # smoothness of the bar
sleep_time = total_time / steps

# Set up a fancy progress bar
with Progress(
    TextColumn("🚀 [bold cyan]Two-Hour Progress[/bold cyan]"),
    BarColumn(bar_width=60, complete_style="bold green", finished_style="bold magenta"),
    TextColumn("[progress.percentage]{task.percentage:>3.1f}%"),
    TimeElapsedColumn(),
    TimeRemainingColumn(),
) as progress:
    task = progress.add_task("Loading...", total=steps)

    for _ in range(steps):
        progress.update(task, advance=1)
        time.sleep(sleep_time)

print("\n🎉 [bold green]All done![/bold green] The 2-hour process has completed successfully.")
