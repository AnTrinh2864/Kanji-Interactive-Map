from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn, TimeElapsedColumn
from rich.console import Console
import time
import random

console = Console()

# total duration (e.g. 0.8 hours)
total_time = 0.8 * 60 * 60
steps = 10000
sleep_time = total_time / steps

# probability triggers
warning_chance = 0.001   # ~1 per 1000 steps
error_chance = 0.0005    # ~1 per 2000 steps


def show_warning(elapsed, progress):
    """Display a warning and get user decision."""
    progress.stop()  # pause rendering

    console.rule("[bold yellow]⚠️ WARNING EVENT[/bold yellow]")
    console.print(f"[yellow]Minor issue detected after [bold]{elapsed:.1f}s[/bold].[/yellow]")
    console.print("[cyan]Options:[/cyan] 1) Reload  2) Ignore")

    choice = ""
    while choice not in ("1", "2"):
        choice = input("👉 Choose (1 or 2): ").strip()
        if choice not in ("1", "2"):
            console.print("[red]Invalid input. Please enter 1 or 2.[/red]")

    if choice == "1":
        console.print("[yellow]Reloading... recalculating elapsed time...[/yellow]")
        time.sleep(1)
        console.rule("[yellow]⚠️ WARNING EVENT CLOSED[/yellow]\n")
        progress.start()
        return "reload"

    console.print("[green]Ignoring warning, continuing...[/green]")
    console.rule("[yellow]⚠️ WARNING EVENT CLOSED[/yellow]\n")
    progress.start()
    return "ignore"


def show_error(elapsed, progress):
    """Display an error and get user decision."""
    progress.stop()  # pause rendering

    console.rule("[bold red]❌ ERROR EVENT[/bold red]")
    console.print(f"[red]Critical issue encountered after [bold]{elapsed:.1f}s[/bold].[/red]")
    console.print("[cyan]Options:[/cyan] 1) Reload  2) Pause")

    choice = ""
    while choice not in ("1", "2"):
        choice = input("👉 Choose (1 or 2): ").strip()
        if choice not in ("1", "2"):
            console.print("[red]Invalid input. Please enter 1 or 2.[/red]")

    if choice == "1":
        console.print("[red]Reloading... restarting calculation of elapsed time...[/red]")
        time.sleep(1)
        console.rule("[red]❌ ERROR EVENT CLOSED[/red]\n")
        progress.start()
        return "reload"

    # Pause handling
    console.print("[magenta]Paused. Options: 1) Resume  2) Kill[/magenta]")
    sub_choice = ""
    while sub_choice not in ("1", "2"):
        sub_choice = input("👉 Choose (1 or 2): ").strip()
        if sub_choice not in ("1", "2"):
            console.print("[yellow]Invalid input. Try again.[/yellow]")

    if sub_choice == "1":
        console.print("[green]Resuming progress...[/green]")
        console.rule("[red]❌ ERROR EVENT CLOSED[/red]\n")
        progress.start()
        return "resume"

    elif sub_choice == "2":
        console.print("[bold red]Process killed by user.[/bold red]")
        console.rule("[red]❌ ERROR EVENT CLOSED[/red]\n")
        progress.start()
        return "kill"


def progress_main():
    start_time = time.time()

    with Progress(
        TextColumn("🚀 [bold cyan]Progress[/bold cyan]"),
        BarColumn(bar_width=80, complete_style="bold green", finished_style="bold magenta"),
        TextColumn("[progress.percentage]{task.percentage:>3.1f}%"),
        TimeElapsedColumn(),
        TimeRemainingColumn(),
    ) as progress:

        task = progress.add_task("Processing...", total=steps)
        current_step = 0

        while current_step < steps:
            progress.update(task, advance=1)
            current_step += 1
            time.sleep(sleep_time)

            elapsed = time.time() - start_time

            # Randomly trigger events
            if random.random() < warning_chance:
                action = show_warning(elapsed, progress)
                if action == "reload":
                    start_time = time.time() - elapsed
                    continue

            if random.random() < error_chance:
                action = show_error(elapsed, progress)
                if action == "reload":
                    start_time = time.time() - elapsed
                    continue
                elif action == "kill":
                    console.print("[red]Exiting due to fatal error...[/red]")
                    return
                elif action == "resume":
                    continue

    console.rule("[bold green]✅ PROCESS COMPLETE[/bold green]")
    console.print("\n🎉 [bold green]All done![/bold green] The process has completed successfully.\n")


if __name__ == "__main__":
    progress_main()
